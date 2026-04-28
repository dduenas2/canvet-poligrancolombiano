const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const Propietario = require('../models/Propietario');
const Canino = require('../models/Canino');
const CategoriaServicio = require('../models/CategoriaServicio');
const Servicio = require('../models/Servicio');
const HistorialClinico = require('../models/HistorialClinico');
const Cita = require('../models/Cita');

const ejecutarSeed = async () => {
  try {
    // Limpiar base de datos
    await Promise.all([
      Usuario.deleteMany({}),
      Propietario.deleteMany({}),
      Canino.deleteMany({}),
      CategoriaServicio.deleteMany({}),
      Servicio.deleteMany({}),
      HistorialClinico.deleteMany({}),
      Cita.deleteMany({})
    ]);
    console.log('🧹 Base de datos limpiada');

    // ==========================================
    // USUARIOS — el modelo hashea la contraseña automáticamente
    // ==========================================
    const usuarios = await Usuario.create([
      {
        nombre: 'Administrador CanVet',
        email: 'admin@canvet.com',
        password: 'admin123',
        rol: 'admin'
      },
      {
        nombre: 'Dra. Laura Martínez',
        email: 'vet1@canvet.com',
        password: 'vet123',
        rol: 'veterinario'
      },
      {
        nombre: 'Dr. Carlos Ramírez',
        email: 'vet2@canvet.com',
        password: 'vet123',
        rol: 'veterinario'
      },
      {
        nombre: 'Ana Gómez',
        email: 'recep@canvet.com',
        password: 'recep123',
        rol: 'recepcionista'
      },
      {
        nombre: 'Juan Pérez',
        email: 'cliente@canvet.com',
        password: 'cliente123',
        rol: 'cliente'
      }
    ]);

    const [admin, vet1, vet2, recep, cliente] = usuarios;
    console.log('👥 Usuarios creados:', usuarios.length);

    // ==========================================
    // PROPIETARIOS
    // ==========================================
    const propietarios = await Propietario.create([
      {
        nombre: 'Juan Pérez García',
        documento: '1012345678',
        telefono: '3101234567',
        email: 'juan@email.com',
        direccion: 'Cra 15 # 80-25, Bogotá',
        usuario: cliente._id
      },
      {
        nombre: 'María Torres López',
        documento: '52234567',
        telefono: '3207654321',
        email: 'maria@email.com',
        direccion: 'Cl 50 # 30-15, Medellín'
      },
      {
        nombre: 'Roberto Silva Rojas',
        documento: '80112233',
        telefono: '3154445566',
        email: 'roberto@email.com',
        direccion: 'Av 6 Norte # 25-18, Cali'
      }
    ]);

    const [prop1, prop2, prop3] = propietarios;
    console.log('👤 Propietarios creados:', propietarios.length);

    // ==========================================
    // CANINOS
    // ==========================================
    const caninos = await Canino.create([
      {
        nombre: 'Rocky',
        raza: 'Labrador Retriever',
        fechaNacimiento: new Date('2020-03-15'),
        peso: 28.5,
        sexo: 'M',
        chip: 'CHI001234',
        propietario: prop1._id,
        fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200'
      },
      {
        nombre: 'Luna',
        raza: 'Golden Retriever',
        fechaNacimiento: new Date('2021-07-22'),
        peso: 24.0,
        sexo: 'H',
        chip: 'CHI005678',
        propietario: prop1._id,
        fotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200'
      },
      {
        nombre: 'Max',
        raza: 'Pastor Alemán',
        fechaNacimiento: new Date('2019-11-05'),
        peso: 32.0,
        sexo: 'M',
        chip: 'CHI009012',
        propietario: prop2._id,
        fotoUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200'
      },
      {
        nombre: 'Coco',
        raza: 'Poodle',
        fechaNacimiento: new Date('2022-01-10'),
        peso: 8.5,
        sexo: 'M',
        propietario: prop2._id
      },
      {
        nombre: 'Bella',
        raza: 'Bulldog Francés',
        fechaNacimiento: new Date('2021-05-18'),
        peso: 12.0,
        sexo: 'H',
        chip: 'CHI003456',
        propietario: prop3._id,
        fotoUrl: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=200'
      }
    ]);

    const [rocky, luna, max, coco, bella] = caninos;
    console.log('🐕 Caninos creados:', caninos.length);

    // ==========================================
    // CATEGORÍAS DE SERVICIO
    // ==========================================
    const categorias = await CategoriaServicio.create([
      {
        nombre: 'Salud Preventiva y Correctiva',
        descripcion: 'Servicios médicos y quirúrgicos para mantener y restaurar la salud canina',
        icono: '💊'
      },
      {
        nombre: 'Estética y Relajación',
        descripcion: 'Servicios de higiene, arreglo estético y bienestar para tu canino',
        icono: '✂️'
      },
      {
        nombre: 'Nutrición y Alimentación',
        descripcion: 'Asesoría y talleres para una alimentación saludable y balanceada',
        icono: '🥗'
      },
      {
        nombre: 'Guardería',
        descripcion: 'Cuidado y alojamiento para tu canino mientras estás ausente',
        icono: '🏠'
      },
      {
        nombre: 'Servicios Funerarios',
        descripcion: 'Servicios de acompañamiento y despedida con dignidad',
        icono: '🕊️'
      }
    ]);

    const [catSalud, catEstetica, catNutricion, catGuarderia, catFunerario] = categorias;
    console.log('📂 Categorías creadas:', categorias.length);

    // ==========================================
    // SERVICIOS
    // ==========================================
    const servicios = await Servicio.create([
      // Salud Preventiva y Correctiva
      { nombre: 'Esterilización', categoria: catSalud._id, precio: 350000, duracionMin: 120, descripcion: 'Procedimiento quirúrgico para esterilización' },
      { nombre: 'Vacunación', categoria: catSalud._id, precio: 45000, duracionMin: 20, descripcion: 'Aplicación de vacunas del esquema sanitario' },
      { nombre: 'Desparasitación', categoria: catSalud._id, precio: 30000, duracionMin: 20, descripcion: 'Tratamiento antiparasitario interno y externo' },
      { nombre: 'Radiología', categoria: catSalud._id, precio: 120000, duracionMin: 30, descripcion: 'Estudio radiológico diagnóstico' },
      { nombre: 'Ecografía', categoria: catSalud._id, precio: 150000, duracionMin: 40, descripcion: 'Imagen ecográfica para diagnóstico' },
      { nombre: 'Control e identificación del canino', categoria: catSalud._id, precio: 25000, duracionMin: 15, descripcion: 'Control de peso, temperatura y signos vitales' },
      { nombre: 'Cirugía preventiva', categoria: catSalud._id, precio: 280000, duracionMin: 90, descripcion: 'Procedimientos quirúrgicos de prevención' },
      { nombre: 'Cirugía correctiva', categoria: catSalud._id, precio: 450000, duracionMin: 180, descripcion: 'Intervenciones quirúrgicas correctivas' },
      { nombre: 'Laboratorio clínico', categoria: catSalud._id, precio: 85000, duracionMin: 30, descripcion: 'Análisis de sangre, orina y otros fluidos' },

      // Estética y Relajación
      { nombre: 'Peluquería canina', categoria: catEstetica._id, precio: 60000, duracionMin: 60, descripcion: 'Baño, corte y secado según raza' },
      { nombre: 'Corte de uñas', categoria: catEstetica._id, precio: 15000, duracionMin: 15, descripcion: 'Corte y lima de uñas' },
      { nombre: 'Limpieza bucal', categoria: catEstetica._id, precio: 80000, duracionMin: 30, descripcion: 'Profilaxis dental profesional' },
      { nombre: 'Masajes relajantes', categoria: catEstetica._id, precio: 45000, duracionMin: 45, descripcion: 'Sesión de masajes terapéuticos caninos' },

      // Nutrición y Alimentación
      { nombre: 'Asesoría nutricional', categoria: catNutricion._id, precio: 70000, duracionMin: 45, descripcion: 'Plan nutricional personalizado' },
      { nombre: 'Taller de alimentación saludable', categoria: catNutricion._id, precio: 50000, duracionMin: 60, descripcion: 'Educación sobre hábitos alimenticios' },

      // Guardería
      { nombre: 'Guardería pasa día', categoria: catGuarderia._id, precio: 35000, duracionMin: 480, descripcion: 'Cuidado durante el día (8 horas)' },
      { nombre: 'Hotel canino (por noche)', categoria: catGuarderia._id, precio: 55000, duracionMin: 1440, descripcion: 'Alojamiento nocturno con cuidado' },

      // Servicios Funerarios
      { nombre: 'Recogida del canino', categoria: catFunerario._id, precio: 80000, duracionMin: 60, descripcion: 'Servicio de recogida a domicilio' },
      { nombre: 'Inhumación', categoria: catFunerario._id, precio: 150000, duracionMin: 90, descripcion: 'Servicio de inhumación con ceremonia' },
      { nombre: 'Entrega de cenizas', categoria: catFunerario._id, precio: 200000, duracionMin: 120, descripcion: 'Cremación y entrega de cenizas en urna' }
    ]);

    console.log('🏥 Servicios creados:', servicios.length);

    // Referenciar servicios por nombre para facilitar seed
    const svcVacunacion = servicios.find(s => s.nombre === 'Vacunación');
    const svcDesparasitacion = servicios.find(s => s.nombre === 'Desparasitación');
    const svcControl = servicios.find(s => s.nombre === 'Control e identificación del canino');
    const svcPeluqueria = servicios.find(s => s.nombre === 'Peluquería canina');
    const svcLaboratorio = servicios.find(s => s.nombre === 'Laboratorio clínico');

    // ==========================================
    // HISTORIAL CLÍNICO
    // ==========================================
    const historiales = await HistorialClinico.create([
      {
        canino: rocky._id,
        veterinario: vet1._id,
        servicio: svcVacunacion._id,
        fecha: new Date('2024-03-10'),
        diagnostico: 'Canino sano, sin alteraciones clínicas',
        tratamiento: 'Vacuna polivalente aplicada. Próxima dosis en 12 meses.',
        observaciones: 'Peso adecuado para la edad y raza'
      },
      {
        canino: rocky._id,
        veterinario: vet2._id,
        servicio: svcControl._id,
        fecha: new Date('2024-06-15'),
        diagnostico: 'Control rutinario semestral',
        tratamiento: 'Desparasitación interna preventiva',
        observaciones: 'Leve sobrepeso. Recomendar dieta balanceada'
      },
      {
        canino: luna._id,
        veterinario: vet1._id,
        servicio: svcLaboratorio._id,
        fecha: new Date('2024-04-20'),
        diagnostico: 'Anemia leve detectada en hemograma',
        tratamiento: 'Suplemento de hierro y vitamina B12 por 30 días',
        observaciones: 'Seguimiento en 30 días'
      },
      {
        canino: max._id,
        veterinario: vet2._id,
        servicio: svcVacunacion._id,
        fecha: new Date('2024-05-05'),
        diagnostico: 'Canino sano. Vacunación al día',
        tratamiento: 'Rabia, moquillo, parvovirus. Revacunación anual.',
        observaciones: 'Excelente condición física'
      },
      {
        canino: bella._id,
        veterinario: vet1._id,
        servicio: svcControl._id,
        fecha: new Date('2024-07-01'),
        diagnostico: 'Infección leve en oído derecho',
        tratamiento: 'Limpieza auditiva + gotas antimicrobianas 7 días',
        observaciones: 'Otitis externa leve. Repetir en 10 días'
      }
    ]);

    console.log('📋 Historiales clínicos creados:', historiales.length);

    // ==========================================
    // CITAS
    // ==========================================
    const hoy = new Date();
    const manana = new Date(hoy); manana.setDate(manana.getDate() + 1);
    const pasadoManana = new Date(hoy); pasadoManana.setDate(pasadoManana.getDate() + 2);

    await Cita.create([
      {
        canino: rocky._id,
        servicio: svcVacunacion._id,
        veterinario: vet1._id,
        fecha: hoy,
        hora: '09:00',
        estado: 'confirmada',
        notas: 'Vacuna anual',
        creadoPor: recep._id
      },
      {
        canino: luna._id,
        servicio: svcPeluqueria._id,
        veterinario: vet2._id,
        fecha: hoy,
        hora: '10:30',
        estado: 'pendiente',
        creadoPor: recep._id
      },
      {
        canino: max._id,
        servicio: svcDesparasitacion._id,
        veterinario: vet1._id,
        fecha: manana,
        hora: '08:30',
        estado: 'pendiente',
        creadoPor: recep._id
      },
      {
        canino: coco._id,
        servicio: svcControl._id,
        veterinario: vet2._id,
        fecha: manana,
        hora: '11:00',
        estado: 'pendiente',
        notas: 'Control de peso y desparasitación',
        creadoPor: recep._id
      },
      {
        canino: bella._id,
        servicio: svcLaboratorio._id,
        veterinario: vet1._id,
        fecha: pasadoManana,
        hora: '14:00',
        estado: 'pendiente',
        notas: 'Hemograma completo de seguimiento',
        creadoPor: recep._id
      }
    ]);

    console.log('📅 Citas creadas');

    console.log('\n✅ SEED COMPLETADO EXITOSAMENTE');
    console.log('===========================================');
    console.log('Credenciales de acceso:');
    console.log('  Admin:       admin@canvet.com     / admin123');
    console.log('  Veterinario: vet1@canvet.com      / vet123');
    console.log('  Veterinario: vet2@canvet.com      / vet123');
    console.log('  Recepción:   recep@canvet.com     / recep123');
    console.log('  Cliente:     cliente@canvet.com   / cliente123');
    console.log('===========================================\n');
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    throw error;
  }
};

module.exports = ejecutarSeed;

// Permitir ejecución directa: `npm run seed`
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
  const conectarDB = require('../config/db');
  (async () => {
    await conectarDB();
    try {
      await ejecutarSeed();
      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  })();
}
