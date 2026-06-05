package com.example.back_end.controller;

import com.example.back_end.model.Admin;
import com.example.back_end.model.Usuario;
import com.example.back_end.service.AdminService;
import com.example.back_end.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*")

public class AdminController {

    private final AdminService adminService;
    private final UsuarioService usuarioService;

    public AdminController(AdminService adminService, UsuarioService usuarioService) {
        this.adminService = adminService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<Admin> login(@RequestBody Admin admin) {
        Admin autentificado = adminService.login(admin.getCorreo(), admin.getPassword());
        if (autentificado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(autentificado);
    }

    @PostMapping("/registro")
    public ResponseEntity<Admin> registrar(@RequestBody Admin admin) {
        Admin existente = adminService.obtenerPorCorreo(admin.getCorreo());
        if (existente != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok(adminService.registrar(admin));
    }

    @GetMapping
    public ResponseEntity<List<Admin>> listarAdmins(@RequestHeader(value = "X-Admin-Id", required = false) Long adminId) {
        if (!administradorValido(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(adminService.listarTodos());
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuarios(@RequestHeader(value = "X-Admin-Id", required = false) Long adminId) {
        if (!administradorValido(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    private boolean administradorValido(Long adminId) {
        if (adminId == null) {
            return false;
        }
        return adminService.obtenerPorId(adminId) != null;
    }
}
