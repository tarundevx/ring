
import sys
from typing import Union, Any, cast

def make_union_type(*types):
    return Union[types]

try:
    print(f"Python version: {sys.version}")
    u = make_union_type(int, str)
    print(f"Union type: {u}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
