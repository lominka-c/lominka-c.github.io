import logging
import httpx
from fastapi import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime

# --- НАЛАШТУВАННЯ ---
MY_DOMAIN = "https://lominka.tech"  # Твій домен для пінгування
SMAKI_API_URL = "https://api.smaki.ua/v1/orders"  # Перевір реальний URL
POLL_INTERVAL_SECONDS = 30  # Як часто перевіряти замовлення
KEEP_ALIVE_MINUTES = 10     # Як часто "будити" сервер

# Зберігаємо оброблені ID замовлень, щоб не було дублів
# При перезавантаженні сервера на Render сет очиститься
processed_orders = set()

app = FastAPI(title="Lominka Delivery Backend")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- ЛОГІКА ПОВІДОМЛЕНЬ ---

async def send_notification(order):
    """Надсилання сповіщення (сюди можна додати Telegram або Firebase)"""
    order_id = order.get('id')
    total = order.get('total_price', '0')
    address = order.get('delivery_address', 'Не вказано')
    
    message = f"🚀 НОВЕ ЗАМОВЛЕННЯ #{order_id}\n💰 Сума: {total} грн\n📍 Адреса: {address}"
    logger.info(f"NOTIFICATION: {message}")
    
    # Приклад для Telegram (розкоментуй, якщо треба):
    # async with httpx.AsyncClient() as client:
    #     await client.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
    #                       json={"chat_id": CHAT_ID, "text": message})

# --- ФОНОВІ ЗАВДАННЯ ---

async def keep_alive_task():
    """Робить зовнішній запит на свій домен, щоб Render не заснув"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{MY_DOMAIN}/health")
            logger.info(f"[{datetime.now()}] Self-poke via {MY_DOMAIN}: {response.status_code}")
        except Exception as e:
            logger.error(f"Keep-alive error: {e}")

async def parse_orders_task():
    """Парсинг API Smaki та порівняння замовлень"""
    global processed_orders
    logger.info(f"[{datetime.now()}] Checking for orders...")
    
    async with httpx.AsyncClient() as client:
        try:
            # Додай headers={"Authorization": "Bearer ..."}, якщо Smaki вимагає токен
            response = await client.get(SMAKI_API_URL, timeout=10.0)
            
            if response.status_code == 200:
                data = response.json()
                # Адаптуємо під структуру Smaki (список замовлень)
                orders = data.get('orders', []) if isinstance(data, dict) else data

                if not orders:
                    return

                # Перевіряємо замовлення (припускаємо, що нові на початку списку)
                for order in orders[:5]:  # Дивимось лише на останні 5 для швидкості
                    order_id = order.get('id')
                    status = order.get('status')

                    # Якщо ID новий та статус підходить для кур'єра
                    if order_id not in processed_orders:
                        if status in ['new', 'confirmed', 'preparing']:
                            await send_notification(order)
                            processed_orders.add(order_id)
                
                # Обмежуємо розмір сету, щоб не переповнювати пам'ять (останні 100 замовлень)
                if len(processed_orders) > 100:
                    processed_orders = set(list(processed_orders)[-100:])
            else:
                logger.error(f"API Smaki error {response.status_code}")
        except Exception as e:
            logger.error(f"Order parsing failed: {e}")

# --- ЗАПУСК ПЛАНУВАЛЬНИКА ---

@app.on_event("startup")
async def start_scheduler():
    scheduler = AsyncIOScheduler()
    
    # Завдання 1: Пінгуємо домен
    scheduler.add_job(keep_alive_task, 'interval', minutes=KEEP_ALIVE_MINUTES)
    
    # Завдання 2: Перевірка замовлень
    scheduler.add_job(parse_orders_task, 'interval', seconds=POLL_INTERVAL_SECONDS)
    
    scheduler.start()
    logger.info("Scheduler active: keep-alive (10m) and parser (30s)")

# --- ЕНДПОІНТИ ---

@app.get("/health")
async def health_check():
    return {"status": "online", "timestamp": datetime.now()}

@app.get("/")
async def root():
    return {"message": "Lominka Delivery Backend is running"}

if __name__ == "__main__":
    import uvicorn
    # На Render порт береться зі змінної середовища $PORT
    uvicorn.run(app, host="0.0.0.0", port=8000)

