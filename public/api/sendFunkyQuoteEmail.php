<?php
require_once 'config.php';

/**
 * Send email via Funky Tiles SMTP using PHP sockets with STARTTLS support.
 */
function sendSMTPFunkyEmail($to, $subject, $htmlBody, $headers = array()) {
    $smtpHost = SMTP_FUNKY_HOST;
    $smtpPort = SMTP_FUNKY_PORT;
    $username = SMTP_FUNKY_USERNAME;
    $password = SMTP_FUNKY_PASSWORD;
    $secure = SMTP_FUNKY_SECURE;

    if ($secure === 'tls') {
        $connectHost = $smtpHost;
    } else {
        $ipv4 = gethostbyname($smtpHost);
        if ($ipv4 === $smtpHost) {
            $connectHost = $smtpHost;
        } else {
            $connectHost = $ipv4;
        }
    }

    $context = stream_context_create([
        'socket' => [
            'tcp_nodelay' => true,
        ]
    ]);

    $socket = @stream_socket_client(
        'tcp://' . $connectHost . ':' . $smtpPort,
        $errno,
        $errstr,
        30,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$socket && $errno === 99) {
        error_log("Funky SMTP connection failed with bind error, trying without explicit context...");
        $socket = @stream_socket_client(
            'tcp://' . $connectHost . ':' . $smtpPort,
            $errno,
            $errstr,
            30,
            STREAM_CLIENT_CONNECT
        );
    }

    if (!$socket && $errno === 99) {
        error_log("Funky SMTP connection failed with IP, trying with hostname...");
        $socket = @stream_socket_client(
            'tcp://' . $smtpHost . ':' . $smtpPort,
            $errno,
            $errstr,
            30,
            STREAM_CLIENT_CONNECT
        );
    }

    if (!$socket) {
        error_log("Funky SMTP connection failed: $errstr ($errno)");
        error_log("Funky SMTP Host: $smtpHost, Connect Host: $connectHost, Port: $smtpPort");
        return false;
    }

    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '220') {
        error_log("Funky SMTP Error: $response");
        fclose($socket);
        return false;
    }

    fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
    $response = fgets($socket, 515);

    while (substr($response, 3, 1) === '-') {
        $response = fgets($socket, 515);
    }

    if ($secure === 'tls') {
        fputs($socket, "STARTTLS\r\n");
        $response = fgets($socket, 515);
        if (substr($response, 0, 3) !== '220') {
            error_log("Funky SMTP STARTTLS failed: $response");
            fclose($socket);
            return false;
        }

        $cryptoOptions = STREAM_CRYPTO_METHOD_TLS_CLIENT;
        if (!stream_socket_enable_crypto($socket, true, $cryptoOptions)) {
            error_log("Funky SMTP TLS negotiation failed");
            fclose($socket);
            return false;
        }

        fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        $response = fgets($socket, 515);

        while (substr($response, 3, 1) === '-') {
            $response = fgets($socket, 515);
        }
    }

    fputs($socket, "AUTH LOGIN\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '334') {
        error_log("Funky SMTP AUTH failed: $response");
        fclose($socket);
        return false;
    }

    fputs($socket, base64_encode($username) . "\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '334') {
        error_log("Funky SMTP Username failed: $response");
        fclose($socket);
        return false;
    }

    fputs($socket, base64_encode($password) . "\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '235') {
        error_log("Funky SMTP Password failed: $response");
        fclose($socket);
        return false;
    }

    fputs($socket, "MAIL FROM: <" . SMTP_FUNKY_FROM_EMAIL . ">\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '250') {
        error_log("Funky SMTP MAIL FROM failed: $response");
        fclose($socket);
        return false;
    }

    fputs($socket, "RCPT TO: <$to>\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '250') {
        error_log("Funky SMTP RCPT TO failed: $response");
        fclose($socket);
        return false;
    }

    fputs($socket, "DATA\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '354') {
        error_log("Funky SMTP DATA failed: $response");
        fclose($socket);
        return false;
    }

    $emailContent = "From: " . SMTP_FUNKY_FROM_NAME . " <" . SMTP_FUNKY_FROM_EMAIL . ">\r\n";
    $emailContent .= "To: $to\r\n";
    $emailContent .= "Subject: $subject\r\n";
    $emailContent .= "Reply-To: " . SMTP_FUNKY_REPLY_TO . "\r\n";
    $emailContent .= "Bcc: " . SMTP_FUNKY_BCC . "\r\n";
    $emailContent .= "MIME-Version: 1.0\r\n";
    $emailContent .= "Content-Type: text/html; charset=" . EMAIL_CHARSET . "\r\n";
    $emailContent .= "Content-Transfer-Encoding: " . EMAIL_ENCODING . "\r\n";
    $emailContent .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $emailContent .= "\r\n";
    $emailContent .= $htmlBody . "\r\n";
    $emailContent .= ".\r\n";

    fputs($socket, $emailContent);
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '250') {
        error_log("Funky SMTP Send failed: $response");
        fclose($socket);
        return false;
    }

    fputs($socket, "QUIT\r\n");
    fclose($socket);

    return true;
}

function sendFunkyQuoteEmail($quoteData, $recipientEmail) {
    error_log('Attempting to send Funky quote email to: ' . $recipientEmail);

    $subject = $quoteData['subject'] ?? 'Your Funky Tiles quote';
    $logoSrc = $quoteData['logo_src'] ?? '';
    $quoteLabel = $quoteData['quote_label'] ?? 'Quote';
    $heading = $quoteData['heading'] ?? 'Thank you for your quote request';
    $items = $quoteData['items'] ?? [];
    $total = $quoteData['total'] ?? 0;

    $quantityTotal = 0;
    $lines = '';
    foreach ($items as $item) {
        $name = htmlspecialchars($item['name'] ?? $item['title'] ?? '', ENT_QUOTES, 'UTF-8');
        $quantity = $item['quantity'] ?? 1;
        $price = $item['price'] ?? 0;
        $quantityTotal += $quantity;
        $lineTotal = number_format($price * $quantity, 2);

        $lines .= '
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">
          <tr>
            <td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#111111;">
              ' . $name . ' &times; ' . htmlspecialchars($quantity, ENT_QUOTES, 'UTF-8') . '
            </td>
            <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#111111;">
              R' . htmlspecialchars($lineTotal, ENT_QUOTES, 'UTF-8') . '
            </td>
          </tr>
        </table>';
    }

    $itemCount = $quoteData['item_count'] ?? ($quantityTotal . ' item' . ($quantityTotal === 1 ? '' : 's'));
    $totalLabel = is_numeric($total) ? 'R' . number_format($total, 2) : $total;

    $htmlBody = '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>' . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . '</title>
  </head>
  <body style="margin:0;padding:0;background-color:#ffffff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
            <tr>
              <td style="padding:8px 8px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" valign="middle">
                      <img src="' . htmlspecialchars($logoSrc, ENT_QUOTES, 'UTF-8') . '" alt="Funky Tiles" width="120" style="display:block;width:120px;height:auto;border:0;" />
                    </td>
                    <td align="right" valign="middle" style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;letter-spacing:1px;color:#8c8c8c;text-transform:uppercase;">
                      ' . htmlspecialchars($quoteLabel, ENT_QUOTES, 'UTF-8') . '
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 8px;font-family:Helvetica,Arial,sans-serif;font-size:28px;line-height:36px;font-weight:700;color:#111111;">
                ' . htmlspecialchars($heading, ENT_QUOTES, 'UTF-8') . '
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 32px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#8c8c8c;">
                We have received your quote request and will be in touch shortly.
              </td>
            </tr>
            <tr>
              <td style="padding:24px 8px 8px;border-top:1px solid #e3e3e3;font-family:Helvetica,Arial,sans-serif;font-size:22px;line-height:28px;font-weight:700;color:#111111;">
                Quote summary
              </td>
            </tr>
            <tr>
              <td style="padding:8px 8px 0;">
                ' . $lines . '
              </td>
            </tr>
            <tr>
              <td style="padding:16px 8px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#111111;">
                      ' . htmlspecialchars($itemCount, ENT_QUOTES, 'UTF-8') . '
                    </td>
                    <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:700;color:#111111;">
                      ' . htmlspecialchars($totalLabel, ENT_QUOTES, 'UTF-8') . '
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>';

    $mailSent = sendSMTPFunkyEmail($recipientEmail, $subject, $htmlBody);
    error_log('Funky SMTP mail send result: ' . ($mailSent ? 'Success' : 'Failed'));

    if (!$mailSent) {
        error_log('Failed to send Funky quote email to: ' . $recipientEmail);
        return false;
    }

    return true;
}
?>
