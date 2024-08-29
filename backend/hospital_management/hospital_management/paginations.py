from rest_framework.pagination import PageNumberPagination
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100 # Default page limits
    page_size_query_param = 'limits' # User can set page limits.
    max_page_size = 1000 # Max page limits. so we can't over it.