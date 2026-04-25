<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create(
    '/api/auth/login',
    'POST',
    [], [], [], 
    ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json'],
    json_encode(['email' => 'karim@autoecole.ma', 'password' => 'cand1234'])
);

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
