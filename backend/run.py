"""一键启动小扬同学（开发模式，SQLite零依赖）"""
import subprocess
import sys
import os

os.environ.pop('DEBUG', None)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("检查依赖...")
try:
    import fastapi, uvicorn, sqlalchemy, pydantic, aiosqlite, multipart
except ImportError:
    print("正在安装依赖...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q",
        "fastapi", "uvicorn[standard]", "sqlalchemy", "aiosqlite",
        "pydantic", "pydantic-settings", "python-jose[cryptography]",
        "passlib[bcrypt]", "python-multipart", "httpx", "python-dotenv"])

print("启动服务...")
print("="*50)
print("  小扬同学 API 启动中")
print("  浏览器打开: http://localhost:8000")
print("  API 文档:   http://localhost:8000/docs")
print("="*50)

subprocess.run([sys.executable, "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])




