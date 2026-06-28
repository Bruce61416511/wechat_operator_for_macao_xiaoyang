import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .core.logging import setup_logging
from .core.database import init_db
from .api.auth import router as auth_router
from .api.applications import router as applications_router
from .api.constitution_rules import router as constitution_rules_router
from .api.chat import router as chat_router
from .api.members import router as members_router, router_admin as admin_members_router, public_router
from .api.events import router as events_router
from .api.notifications import router as notifications_router
from .api.announcements import router as announcements_router
from .api.resources import router as resources_router

setup_logging()

app = FastAPI(title="小揚同學 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(applications_router)
app.include_router(constitution_rules_router)
app.include_router(chat_router)
app.include_router(public_router)
app.include_router(members_router)
app.include_router(admin_members_router)
app.include_router(events_router)
app.include_router(notifications_router)
app.include_router(announcements_router)
app.include_router(resources_router)

# 託管舊前端靜態頁面
frontend_path = Path(__file__).parent.parent.parent / "frontend-web" / "src" / "pages"
if frontend_path.exists():
    app.mount("/pages", StaticFiles(directory=str(frontend_path), html=True), name="frontend")

# 託管上傳文件（繳費憑證等）
uploads_path = Path(__file__).parent.parent / "uploads"
if uploads_path.exists():
    app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# 託管新前端構建產物 (React SPA)
new_frontend_dist = Path(__file__).parent.parent.parent / "frontend-web-new" / "dist"
if new_frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(new_frontend_dist / "assets")), name="spa-assets")

    @app.get("/app/{full_path:path}")
    async def spa_fallback(full_path: str = ""):
        """Serve the React SPA - all /app/* routes fall back to index.html"""
        index_path = new_frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"error": "frontend not built"}

    @app.get("/app")
    async def spa_root():
        index_path = new_frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"error": "frontend not built"}


@app.on_event("startup")
async def startup():
    await init_db()
    from .models.notification import Notification  # ensure table creation
    from .models.announcement import Announcement  # ensure table creation
    from .models.resource import Resource  # ensure table creation
    from .core.seed import seed_root
    await seed_root()


@app.get("/")
async def root():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/app/")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.middleware("http")
async def spa_fallback_middleware(request, call_next):
    """SPA fallback: 静态文件从 dist 根目录提供，其他路径返回 index.html"""
    response = await call_next(request)
    if response.status_code == 404:
        path = request.url.path
        # API 和已知静态路径不处理
        skip = ["/v1/", "/docs", "/openapi.json", "/health", "/uploads", "/pages", "/assets", "/redoc"]
        if any(path.startswith(p) for p in skip):
            return response
        # 静态文件：从 dist 根目录提供（public 图片等）
        filename = path.lstrip("/")
        file_path = new_frontend_dist / filename
        if file_path.exists() and file_path.is_file():
            from fastapi.responses import FileResponse
            return FileResponse(str(file_path))
        # SPA fallback
        idx = new_frontend_dist / "index.html"
        if idx.exists():
            from fastapi.responses import FileResponse
            return FileResponse(str(idx))
    return response
