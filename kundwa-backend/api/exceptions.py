import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

def custom_api_exception_handler(exc, context):
    """
    Custom exception handler to ensure that API requests always receive
    a structured JSON response even during unhandled 500/database exceptions,
    preventing raw HTML 500 pages from reaching the client.
    """
    response = exception_handler(exc, context)

    if response is None:
        logger.error(f"Unhandled Server Error: {exc}", exc_info=True)
        error_msg = str(exc) or "Internal server error occurred while processing request."
        # Sanitize sensitive database credentials if any leaked in error string
        if "@" in error_msg and "://" in error_msg:
            error_msg = "Database connection or write error. Please check database status."
            
        return Response(
            {
                "detail": error_msg,
                "status": 500,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content_type="application/json"
        )

    return response
