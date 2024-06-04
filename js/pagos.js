function showSection(id) {
    $('.content-section').hide();
    $('#' + id).show();

    if (id === 'add' || id === 'update') {
        loadEstudiantes(id);
    }
}

var currentPagos = [];
var currentEstudiantes = [];
var currentPage = 1;
var rowsPerPage = 20;

function loadEstudiantes(section) {
    $.get('https://172.16.7.10:5022/api/Estudiantes', function(data) {
        currentEstudiantes = data;
        var select = section === 'add' ? $('#addIdEstudiante') : $('#updateIdEstudiante');
        select.empty();
        data.forEach(function(estudiante) {
            select.append(new Option(estudiante.nombres + ' ' + estudiante.apellidos, estudiante.id_estudiante));
        });
    });
}

function displayPagos(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    var paginatedItems = currentPagos.slice(startIndex, endIndex);

    $('#pagoList').empty();

    paginatedItems.forEach(function(pago) {
        // Hacer la llamada a la API para obtener el nombre del estudiante
        $.get('https://172.16.7.10:5022/api/Estudiantes/' + pago.id_estudiante, function(estudiante) {
            var nombreCompleto = estudiante.nombres + ' ' + estudiante.apellidos;

            $('#pagoList').append(`
                <tr>
                    <td>${pago.id_pago}</td>
                    <td>${pago.id_estudiante}</td>
                    <td>${nombreCompleto}</td>
                    <td>${pago.fecha_pago}</td>
                    <td>${pago.saldo}</td>
                    <td>${pago.semestre}</td>
                    <td>${pago.estado}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="loadPagoForUpdate(${pago.id_pago})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="loadPagoForDelete(${pago.id_pago})">Eliminar</button>
                    </td>
                </tr>
            `);
        }).fail(function() {
            $('#pagoList').append(`
                <tr>
                    <td>${pago.id_pago}</td>
                    <td>${pago.id_estudiante}</td>
                    <td>No encontrado</td>
                    <td>${pago.fecha_pago}</td>
                    <td>${pago.saldo}</td>
                    <td>${pago.semestre}</td>
                    <td>${pago.estado}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="loadPagoForUpdate(${pago.id_pago})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="loadPagoForDelete(${pago.id_pago})">Eliminar</button>
                    </td>
                </tr>
            `);
        });
    });

    setupPagination(currentPagos.length, page);
}

function setupPagination(totalItems, currentPage) {
    var totalPages = Math.ceil(totalItems / rowsPerPage);
    $('#pagination').empty();

    for (let i = 1; i <= totalPages; i++) {
        var liClass = currentPage === i ? 'page-item active' : 'page-item';
        var pageItem = `<li class="${liClass}"><a class="page-link" href="#" onclick="displayPagos(${i})">${i}</a></li>`;
        $('#pagination').append(pageItem);
    }
}

function getPagos() {
    $.get('https://172.16.7.10:5022/api/Pagos', function(data) {
        currentPagos = data.sort((a, b) => b.id_pago - a.id_pago); // Ordenar por id_pago de forma descendente

        if (data.length) {
            displayPagos(1);
            $('#errorMessage').hide();
        } else {
            $('#errorMessage').show().text('No hay pagos disponibles');
        }
    });
}

function getPagoByEstudianteId() {
    var id = $('#searchId').val().trim();
    if (!id) {
        getPagos();
        return;
    }
    $.get('https://172.16.7.10:5022/api/Pagos/Estudiante/' + encodeURIComponent(id), function(data) {
        currentPagos = data.sort((a, b) => b.id_pago - a.id_pago); // Ordenar por id_pago de forma descendente
        displayPagos(1);
    }).fail(function() {
        $('#errorMessage').show().text('Pago no encontrado');
    });
}

function addPago() {
    var id_estudiante = $('#addIdEstudiante').val();
    var fecha_pago = $('#addFechaPago').val().trim();
    var saldo = $('#addSaldo').val().trim();
    var semestre = $('#addSemestre').val();
    var estado = $('#addEstado').val();

    if (!id_estudiante || !fecha_pago || !saldo || !semestre || !estado) {
        alert('Por favor complete todos los campos');
        return;
    }

    $.post('https://172.16.7.10:5022/api/Pagos', {
        id_estudiante: id_estudiante,
        fecha_pago: fecha_pago,
        saldo: saldo,
        semestre: semestre,
        estado: estado
    }, function(data) {
        alert('Pago agregado con éxito');
        getPagos();
    });
}

function loadPagoForUpdate(id) {
    $.get('https://172.16.7.10:5022/api/Pagos/' + id, function(data) {
        if (data) {
            $('#updateIdPago').val(data.id_pago);
            $('#updateIdEstudiante').val(data.id_estudiante);
            $('#updateFechaPago').val(data.fecha_pago);
            $('#updateSaldo').val(data.saldo);
            $('#updateSemestre').val(data.semestre);
            $('#updateEstado').val(data.estado);
            showSection('update');
        } else {
            alert('Pago no encontrado');
        }
    }).fail(function() {
        alert('Error al obtener los datos del pago');
    });
}

function updatePago() {
    var id_pago = $('#updateIdPago').val().trim();
    var id_estudiante = $('#updateIdEstudiante').val();
    var fecha_pago = $('#updateFechaPago').val().trim();
    var saldo = $('#updateSaldo').val().trim();
    var semestre = $('#updateSemestre').val();
    var estado = $('#updateEstado').val();

    if (!id_pago || !id_estudiante || !fecha_pago || !saldo || !semestre || !estado) {
        alert('Por favor, complete todos los campos');
        return;
    }

    $.ajax({
        url: 'https://172.16.7.10:5022/api/Pagos/' + id_pago,
        method: 'PUT',
        data: {
            id_pago: id_pago,
            id_estudiante: id_estudiante,
            fecha_pago: fecha_pago,
            saldo: saldo,
            semestre: semestre,
            estado: estado
        },
        success: function(result) {
            alert('Pago actualizado con éxito');
            getPagos();
        },
        error: function() {
            alert('Error al actualizar el pago');
        }
    });
}

function loadPagoForDelete(id) {
    $('#deleteIdPago').val(id);
    showSection('delete');
}

function deletePago() {
    var id_pago = $('#deleteIdPago').val().trim();

    if (!id_pago) {
        alert('Por favor, proporcione un ID de Pago');
        return;
    }

    $.ajax({
        url: 'https://172.16.7.10:5022/api/Pagos/' + id_pago,
        method: 'DELETE',
        success: function(result) {
            alert('Pago eliminado con éxito');
            getPagos();
        },
        error: function() {
            alert('Error al eliminar el pago');
        }
    });
}

$(document).ready(function() {
    getPagos();
});
