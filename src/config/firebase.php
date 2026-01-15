<?php

return [
    'project_id' => env('FIREBASE_PROJECT_ID', ''),
    'jwks_json' => env('FIREBASE_JWKS_JSON', ''),
    'auth_disabled' => (bool) env('FIREBASE_AUTH_DISABLED', false),
];


