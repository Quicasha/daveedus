# Tiny static server for local testing of Daveedus (no dependencies)
$port = 8317
$root = $PSScriptRoot
$mime = @{
    '.html'        = 'text/html; charset=utf-8'
    '.css'         = 'text/css; charset=utf-8'
    '.js'          = 'application/javascript; charset=utf-8'
    '.json'        = 'application/json'
    '.webmanifest' = 'application/manifest+json'
    '.png'         = 'image/png'
    '.svg'         = 'image/svg+xml'
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Output "Daveedus test server on http://localhost:$port"
while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
        $file = $ctx.Request.Url.AbsolutePath
        if ($file -eq '/' -or $file -eq '') { $file = '/index.html' }
        $p = Join-Path $root ($file.TrimStart('/') -replace '/', '\')
        if ((Test-Path $p -PathType Leaf) -and $p.StartsWith($root)) {
            $bytes = [IO.File]::ReadAllBytes($p)
            $ext = [IO.Path]::GetExtension($p).ToLower()
            if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
            if ($ctx.Request.HttpMethod -eq 'HEAD') {
                $ctx.Response.ContentLength64 = $bytes.Length
                $ctx.Response.Close()
            } else {
                $ctx.Response.Close($bytes, $false)
            }
        } else {
            $ctx.Response.StatusCode = 404
            $ctx.Response.Close()
        }
    } catch {
        Write-Output "ERR: $($_.Exception.Message)"
    }
}
