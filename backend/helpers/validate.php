<?php
// backend/helpers/validate.php
// Server-side input validation helpers.
// All validation happens here — never trust client-side checks alone.

declare(strict_types=1);

/**
 * Check that all required field names exist and are non-empty in $data.
 *
 * @param  string[] $required  Field names that must be present
 * @param  array    $data      Associative array of input data
 * @return string[]            Names of fields that are missing or empty
 */
function validateRequired(array $required, array $data): array {
    $missing = [];
    foreach ($required as $field) {
        $value = $data[$field] ?? null;
        // Treat empty string and null as missing; 0 is valid
        if ($value === null || (is_string($value) && trim($value) === '')) {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Validate an email address using PHP's built-in filter.
 */
function validateEmail(string $email): bool {
    return filter_var(trim($email), FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate a phone number: must be exactly 10 digits (Indian mobile format).
 * Strips spaces, dashes, and parentheses before checking.
 */
function validatePhone(string $phone): bool {
    $digits = preg_replace('/[\s\-().+]/', '', $phone);
    return (bool) preg_match('/^\d{10}$/', $digits);
}

/**
 * Validate a datetime string in 'Y-m-d H:i:s' or 'Y-m-d\TH:i' (HTML datetime-local) format.
 * Returns a normalised 'Y-m-d H:i:s' string, or null if invalid.
 */
function validateDatetime(string $value): ?string {
    $value = trim($value);
    // Try ISO 8601 with seconds
    $dt = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $value);
    if ($dt === false) {
        // Try HTML datetime-local format (no seconds)
        $dt = DateTimeImmutable::createFromFormat('Y-m-d\TH:i', $value);
    }
    if ($dt === false) {
        // Try Y-m-d\TH:i:s (with T separator)
        $dt = DateTimeImmutable::createFromFormat('Y-m-d\TH:i:s', $value);
    }
    return $dt !== false ? $dt->format('Y-m-d H:i:s') : null;
}
