package com.example.back_end.security;

import com.example.back_end.model.Usuario;
import com.example.back_end.repository.UsuarioRepository;
import dev.samstevens.totp.exceptions.QrGenerationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/2fa")
@CrossOrigin(origins = "*")
public class TwoFactorController {

    private final TwoFactorService twoFactorService;
    private final UsuarioRepository usuarioRepository;

    public TwoFactorController(TwoFactorService twoFactorService,
                                UsuarioRepository usuarioRepository) {
        this.twoFactorService = twoFactorService;
        this.usuarioRepository = usuarioRepository;
    }

    // Paso 1: activar 2FA — recibe el correo en el body
    @PostMapping("/setup")
    public ResponseEntity<?> setup(@RequestBody Map<String, String> body)
            throws QrGenerationException {

        String correo = body.get("correo");
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String secret = twoFactorService.generateSecret();
        usuario.setTwoFactorSecret(secret);
        usuarioRepository.save(usuario);

        String qrUri = twoFactorService.generateQrImageUri(secret, correo);
        return ResponseEntity.ok(Map.of("qrCode", qrUri));
    }

    // Paso 2: confirmar el QR escaneado
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body) {
        String correo = body.get("correo");
        String code = body.get("code");

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (twoFactorService.verifyCode(usuario.getTwoFactorSecret(), code)) {
            usuario.setTwoFactorEnabled(true);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(Map.of("message", "2FA activado correctamente"));
        }

        return ResponseEntity.status(400).body(Map.of("error", "Código inválido"));
    }

    // Paso 3: validar código en cada login
    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody Map<String, String> body) {
        String correo = body.get("correo");
        String code = body.get("code");

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!usuario.isTwoFactorEnabled()) {
            return ResponseEntity.ok(Map.of("message", "2FA no está activado para este usuario"));
        }

        if (twoFactorService.verifyCode(usuario.getTwoFactorSecret(), code)) {
            return ResponseEntity.ok(Map.of("valid", true));
        }

        return ResponseEntity.status(401).body(Map.of("error", "Código 2FA incorrecto"));
    }
}