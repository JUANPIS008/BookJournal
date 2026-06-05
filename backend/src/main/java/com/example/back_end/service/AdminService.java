package com.example.back_end.service;

import com.example.back_end.model.Admin;
import com.example.back_end.repository.AdminRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository repository;

    public AdminService(AdminRepository repository) {
        this.repository = repository;
    }

    public Admin registrar(Admin admin) {
        admin.setFechaRegistro(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        admin.setRol("ADMIN");
        return repository.save(admin);
    }

    public Admin login(String correo, String password) {
        Optional<Admin> admin = repository.findByCorreo(correo);
        if (admin.isPresent() && admin.get().getPassword().equals(password)) {
            return admin.get();
        }
        return null;
    }

    public Admin obtenerPorId(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Admin obtenerPorCorreo(String correo) {
        return repository.findByCorreo(correo).orElse(null);
    }

    public List<Admin> listarTodos() {
        return repository.findAll();
    }
}
