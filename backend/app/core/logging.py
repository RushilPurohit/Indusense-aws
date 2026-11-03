import logging as std_logging

try:
    from loguru import logger
    logger.remove()
    logger.add(sys.stdout, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")
    try:
        logger.add("logs/backend.log", rotation="10 MB", retention="10 days", level="INFO")
    except Exception:
        pass

    def get_logger(name: str):
        return logger.bind(name=name)

except ImportError:
    std_logging.basicConfig(level=std_logging.INFO, format="%(asctime)s | %(levelname)-8s | %(name)s - %(message)s")
    def get_logger(name: str):
        return std_logging.getLogger(name)
