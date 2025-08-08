@echo off

:: 检查是否安装了Node.js
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo 正在使用Node.js启动服务器...
    :: 检查是否安装了http-server
    npm list -g http-server >nul 2>nul
    if %errorlevel% equ 0 (
        http-server -p 8000
    ) else (
        echo 未找到http-server，正在安装...
        npm install -g http-server
        http-server -p 8000
    )
) else (
    echo 未找到Node.js，尝试使用PowerShell启动服务器...
    powershell -Command "
        $listener = New-Object System.Net.HttpListener;
        $listener.Prefixes.Add('http://localhost:8000/');
        $listener.Start();
        Write-Host '服务器已启动在 http://localhost:8000';
        Write-Host '按Ctrl+C停止服务器';
        while ($listener.IsListening) {
            $context = $listener.GetContext();
            $request = $context.Request;
            $response = $context.Response;
            
            $path = $request.Url.LocalPath;
            if ($path -eq '/') {
                $path = '/index.html';
            }
            
            $filePath = Join-Path -Path (Get-Location) -ChildPath $path.TrimStart('/');
            
            if (Test-Path -Path $filePath -PathType Leaf) {
                $content = Get-Content -Path $filePath -Raw;
                $response.ContentLength64 = [System.Text.Encoding]::UTF8.GetByteCount($content);
                $response.OutputStream.Write([System.Text.Encoding]::UTF8.GetBytes($content), 0, [System.Text.Encoding]::UTF8.GetByteCount($content));
            } else {
                $response.StatusCode = 404;
                $content = '文件未找到';
                $response.ContentLength64 = [System.Text.Encoding]::UTF8.GetByteCount($content);
                $response.OutputStream.Write([System.Text.Encoding]::UTF8.GetBytes($content), 0, [System.Text.Encoding]::UTF8.GetByteCount($content));
            }
            
            $response.Close();
        }
    "
)

pause