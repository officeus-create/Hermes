import os
if os.name != "nt":
    raise ImportError("This compatibility module is Windows-only")
import msvcrt
LOCK_EX = 2
LOCK_NB = 4
LOCK_UN = 8
def flock(fileobj, operation):
    fileobj.flush()
    fileobj.seek(0, 2)
    if fileobj.tell() == 0:
        fileobj.write("\0")
        fileobj.flush()
    fileobj.seek(0)
    if operation & LOCK_UN:
        try:
            msvcrt.locking(fileobj.fileno(), msvcrt.LK_UNLCK, 1)
        except OSError:
            pass
        return
    mode = msvcrt.LK_NBLCK if (operation & LOCK_NB) else msvcrt.LK_LOCK
    try:
        msvcrt.locking(fileobj.fileno(), mode, 1)
    except OSError as exc:
        raise BlockingIOError(str(exc)) from exc