import logging.handlers

import coloredlogs


def configure(verbose=False):
    logging_level = logging.INFO if verbose else logging.DEBUG

    logging.captureWarnings(True)

    log_format = "%(asctime)-20s %(module)-11s %(levelname)-8s %(message)s"

    coloredlogs.install(
        level=logging_level,
        fmt=log_format
    )

    logger = logging.getLogger("virtool")

    handler = logging.handlers.RotatingFileHandler("virtool.log", maxBytes=1000000, backupCount=5)
    handler.setFormatter(logging.Formatter(log_format))

    logger.addHandler(handler)

    return logger
