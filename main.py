import logging
import httpx
import firebase_admin
from firebase_admin import credentials, messaging
from fastapi import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime

# --- НАЛАШТУВАННЯ ---
MY_DOMAIN = "https://lominka.tech"  # Твій домен для пінгування
SMAKI_API_URL = "https://api.smaki.ua/v1/orders"  # Реальний API Смакі
POLL_INTERVAL = 30  # секунд (як часто перевіряти замовлення)

# --- ІНІЦІАЛІЗАЦІЯ FIREBASE ---
# Файл service-account.json має лежати в тій же папці, що і цей скрипт
try:
    cred = credentials.Certificate("service-account.json")
    firebase_admin.initialize_app(cred)
    print("Firebase успішно ініціалізовано.")
except Exception as e:
    print(f"Помилка ініціалізації Firebase: {e}")

app = FastAPI(title="Lominka Backend")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("delivery_service")

# Пам'ять для ID замовлень (щоб не надсилати дублі)
processed_orders = set()

# --- ФУНКЦІЯ НАДСИЛАННЯ PUSH ---

async def send_fcm_notification(order_data):
    """Надсилає реальний Push-сповіщення у Flutter додаток"""
    order_id = str(order_data.get('id', '0'))
    address = order_data.get('delivery_address', 'Адреса не вказана')
    total = str(order_data.get('total_price', '0'))

    # Створюємо об'єкт повідомлення для теми "couriers"
    message = messaging.Message(
        notification=messaging.Notification(
            title=f"Нове замовлення #{order_id}",
            body=f"Сума: {total} грн. Адреса: {address}",
        ),
        # Додаткові дані для обробки логіки всередині додатка
        data={
            "order_id": order_id,
            "status": "new",
        },
        topic="couriers",
    )

    try:
        response = messaging.send(message)
        logger.info(f"✅ Push надіслано успішно. ID: {response}")
    except Exception as e:
        logger.error(f"❌ Помилка надсилання Push: {e}")

# --- ФОНОВІ ЗАДАЧІ ---

async def keep_alive_task():
    """Зовнішній запит на свій домен, щоб Render не вимкнув сервер"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{MY_DOMAIN}/health")
            logger.info(f"💤 Anti-sleep check: {resp.status_code}")
        except Exception as e:
            logger.error(f"Keep-alive error: {e}")

async def parse_orders_task():
    """Парсинг API замовлень та порівняння ID"""
    global processed_orders
    logger.info(f"🔎 Перевірка API Смакі... {datetime.now().strftime('%H:%M:%S')}")
    
    async with httpx.AsyncClient() as client:
        try:
            # Якщо потрібна авторизація, додай headers={"Authorization": "Bearer ..."}
            response = await client.get(SMAKI_API_URL, timeout=10.0)
            
            if response.status_code == 200:
                data = response.json()
                # Адаптація під структуру: список або об'єкт з ключем 'orders'
                orders = data.get('orders', []) if isinstance(data, dict) else data

                if not orders:
                    return

                for order in orders[:3]: # Перевіряємо тільки найсвіжіші
                    o_id = order.get('id')
                    status = order.get('status')

                    if o_id not in processed_orders:
                        # Тільки якщо замовлення актуальне для кур'єра
                        if status in ['new', 'confirmed', 'preparing', 'cooking']:
                            await send_fcm_notification(order)
                            processed_orders.add(o_id)
                
                # Обмежуємо розмір сету
                if len(processed_orders) > 100:
                    processed_orders = set(list(processed_orders)[-100:])
            else:
                logger.error(f"API Smaki помилка: {response.status_code}")
        except Exception as e:
            logger.error(f"Помилка з'єднання з API: {e}")

# --- ПЛАНУВАЛЬНИК ---

@app.on_event("startup")
async def start_scheduler():
    scheduler = AsyncIOScheduler()
    # "Будильник" кожні 10 хвилин
    scheduler.add_job(keep_alive_task, 'interval', minutes=10)
    # Перевірка замовлень кожні 30 секунд
    scheduler.add_job(parse_orders_task, 'interval', seconds=POLL_INTERVAL)
    
    scheduler.start()
    logger.info("✅ Планувальник запущено.")

# --- ЕНДПОІНТИ ---

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.now().isoformat()}

@app.get("/test")
async def manual_test():
    """Ендпоінт для ручного тесту пуш-повідомлення"""
    test_order = {
        "id": 777,
        "total_price": "500",
        "delivery_address": "Львів, Пл. Ринок 1",
        "status": "new"
    }
    await send_fcm_notification(test_order)
    return {"message": "Test push sent to Firebase topic 'couriers'"}

@app.get("/")
def home():
    return {"info": "Lominka Delivery Backend", "active": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

