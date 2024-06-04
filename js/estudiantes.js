function showSection(id) {
    $('.content-section').hide();
    $('#' + id).show();
}

var currentStudents = [];
var currentPage = 1;
var rowsPerPage = 20;

function displayStudents(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    var paginatedItems = currentStudents.slice(startIndex, endIndex);

    $('#studentList').empty();

    paginatedItems.forEach(function(student) {
        $('#studentList').append(`
            <tr>
                <td>${student.id_estudiante}</td>
                <td>${student.nombres}</td>
                <td>${student.apellidos}</td>
                <td>${student.correo_electronico}</td>
                <td>${student.programa_academico}</td>
                <td>${student.estado_matricula}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="loadStudentForUpdate('${student.id_estudiante}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="loadStudentForDelete('${student.id_estudiante}')">Eliminar</button>
                </td>
            </tr>
        `);
    });

    setupPagination(currentStudents.length, page);
}

function setupPagination(totalItems, currentPage) {
    var totalPages = Math.ceil(totalItems / rowsPerPage);
    $('#pagination').empty();

    for (let i = 1; i <= totalPages; i++) {
        var liClass = currentPage === i ? 'page-item active' : 'page-item';
        var pageItem = `<li class="${liClass}"><a class="page-link" href="#" onclick="displayStudents(${i})">${i}</a></li>`;
        $('#pagination').append(pageItem);
    }
}

function getStudents() {
    $.get('https://172.16.7.10:5022/api/Estudiantes', function(data) {
        currentStudents = data;

        if (data.length) {
            displayStudents(1);
            $('#errorMessage').hide();
        } else {
            $('#errorMessage').show().text('No hay estudiantes disponibles');
        }
    });
}

function getStudentById() {
    var id = $('#searchId').val().trim();
    if (!id) {
        getStudents();
        return;
    }

    $.get('https://172.16.7.10:5022/api/Estudiantes/' + encodeURIComponent(id), function(data) {
        currentStudents = [data];
        displayStudents(1);
    }).fail(function() {
        $('#errorMessage').show().text('Estudiante no encontrado');
    });
}

function addStudent() {
    var id_estudiante = $('#addIdEstudiante').val().trim();
    var nombres = $('#addNombres').val().trim();
    var apellidos = $('#addApellidos').val().trim();
    var correoElectronico = $('#addCorreoElectronico').val().trim();
    var programaAcademico = $('#addProgramaAcademico').val().trim();
    var estadoMatricula = $('#addEstadoMatricula').val().trim();

    if (!id_estudiante || !nombres || !apellidos || !correoElectronico || !programaAcademico || !estadoMatricula) {
        alert('Por favor complete todos los campos');
        return;
    }

    $.post('https://172.16.7.10:5022/api/Estudiantes', {
        id_estudiante: id_estudiante,
        nombres: nombres,
        apellidos: apellidos,
        correo_electronico: correoElectronico,
        programa_academico: programaAcademico,
        estado_matricula: estadoMatricula
    }, function(data) {
        alert('Estudiante agregado con éxito');
        getStudents();
    });
}

function loadStudentForUpdate(id) {
    $.get('https://172.16.7.10:5022/api/Estudiantes/' + encodeURIComponent(id), function(data) {
        if (data) {
            $('#updateId').val(data.id_estudiante);
            $('#updateNombres').val(data.nombres);
            $('#updateApellidos').val(data.apellidos);
            $('#updateCorreoElectronico').val(data.correo_electronico);
            $('#updateProgramaAcademico').val(data.programa_academico);
            $('#updateEstadoMatricula').val(data.estado_matricula);
            showSection('update');
        } else {
            alert('Estudiante no encontrado');
        }
    }).fail(function() {
        alert('Error al obtener los datos del estudiante');
    });
}

function updateStudent() {
    var id_estudiante = $('#updateId').val().trim();
    var nombres = $('#updateNombres').val().trim();
    var apellidos = $('#updateApellidos').val().trim();
    var correoElectronico = $('#updateCorreoElectronico').val().trim();
    var programaAcademico = $('#updateProgramaAcademico').val().trim();
    var estadoMatricula = $('#updateEstadoMatricula').val().trim();

    if (!id_estudiante || !nombres || !apellidos || !correoElectronico || !programaAcademico || !estadoMatricula) {
        alert('Por favor, complete todos los campos');
        return;
    }

    $.ajax({
        url: 'https://172.16.7.10:5022/api/Estudiantes/' + encodeURIComponent(id_estudiante),
        method: 'PUT',
        data: {
            id_estudiante: id_estudiante,
            nombres: nombres,
            apellidos: apellidos,
            correo_electronico: correoElectronico,
            programa_academico: programaAcademico,
            estado_matricula: estadoMatricula
        },
        success: function(result) {
            alert('Estudiante actualizado con éxito');
            getStudents();
        },
        error: function() {
            alert('Error al actualizar el estudiante');
        }
    });
}

function loadStudentForDelete(id) {
    $('#deleteId').val(id);
    showSection('delete');
}

function deleteStudent() {
    var id_estudiante = $('#deleteId').val().trim();

    if (!id_estudiante) {
        alert('Por favor, proporcione un ID');
        return;
    }

    $.ajax({
        url: 'https://172.16.7.10:5022/api/Estudiantes/' + encodeURIComponent(id_estudiante),
        method: 'DELETE',
        success: function(result) {
            alert('Estudiante eliminado con éxito');
            getStudents();
        },
        error: function() {
            alert('Error al eliminar el estudiante');
        }
    });
}

$(document).ready(function() {
    getStudents();
});
