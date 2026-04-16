import typing
import sqlalchemy.util.typing
from sqlalchemy.orm import DeclarativeBase

# Patch SQLAlchemy for Python 3.14 compatibility
# sqlalchemy.util.typing.make_union_type uses Union.__getitem__(types)
# which fails on Python 3.14.3+ with:
# TypeError: descriptor '__getitem__' requires a 'typing.Union' object but received a 'tuple'
if not hasattr(sqlalchemy.util.typing, "_patched_314"):
    def patched_make_union_type(*types):
        return typing.Union[types]
    sqlalchemy.util.typing.make_union_type = patched_make_union_type
    sqlalchemy.util.typing._patched_314 = True


class Base(DeclarativeBase):
    pass

