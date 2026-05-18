<?php
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ServiHogar API - Status</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --bg: #0f172a;
            --card-bg: #1e293b;
            --text-main: #f8fafc;
            --text-dim: #94a3b8;
            --success: #10b981;
            --warning: #f59e0b;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
        }

        .container {
            width: 100%;
            max-width: 600px;
            padding: 2rem;
            position: relative;
            z-index: 1;
        }

        /* Glassmorphism Background Decoration */
        .blob {
            position: absolute;
            width: 300px;
            height: 300px;
            background: linear-gradient(135deg, var(--primary), #8b5cf6);
            filter: blur(80px);
            border-radius: 50%;
            z-index: -1;
            opacity: 0.4;
            animation: move 20s infinite alternate;
        }

        @keyframes move {
            from { transform: translate(-10%, -10%); }
            to { transform: translate(20%, 20%); }
        }

        .card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            text-align: center;
        }

        .logo {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(to right, #818cf8, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.5rem 1rem;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: var(--success);
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 2rem;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            margin-right: 8px;
            box-shadow: 0 0 10px var(--success);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }

        .endpoints {
            text-align: left;
            margin-top: 1.5rem;
        }

        .endpoint-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 0.75rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }

        .endpoint-item:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateX(5px);
        }

        .endpoint-name {
            font-family: monospace;
            color: #818cf8;
        }

        .endpoint-method {
            font-size: 0.75rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: #4f46e5;
            color: white;
        }

        .footer {
            margin-top: 2rem;
            color: var(--text-dim);
            font-size: 0.875rem;
        }

        .description {
            color: var(--text-dim);
            margin-bottom: 2rem;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="blob"></div>
    <div class="container">
        <div class="card">
            <h1 class="logo">ServiHogar API</h1>
            <div class="status-badge">
                <span class="status-dot"></span>
                System Operational
            </div>
            
            <p class="description">
                The PHP development server is running correctly. 
                Below are the available endpoints for the frontend application.
            </p>

            <div class="endpoints">
                <div class="endpoint-item">
                    <span class="endpoint-name">/login.php</span>
                    <span class="endpoint-method">POST</span>
                </div>
                <div class="endpoint-item">
                    <span class="endpoint-name">/register.php</span>
                    <span class="endpoint-method">POST</span>
                </div>
                <div class="endpoint-item">
                    <span class="endpoint-name">/forgot-password.php</span>
                    <span class="endpoint-method">POST</span>
                </div>
                <div class="endpoint-item">
                    <span class="endpoint-name">/reset-password.php</span>
                    <span class="endpoint-method">POST</span>
                </div>
            </div>

            <div class="footer">
                PHP Version <?php echo phpversion(); ?> &bull; Localhost:8000
            </div>
        </div>
    </div>
</body>
</html>
