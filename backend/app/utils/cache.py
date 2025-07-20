import redis
import os

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)

def get_cache(key: str):
    value = redis_client.get(key)
    if value:
        return value.decode("utf-8")
    return None

def set_cache(key: str, value, expire: int = 300):
    redis_client.setex(key, expire, value)

def delete_cache(key: str):
    redis_client.delete(key)
