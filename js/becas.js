function showSection(id) {
    $('.content-section').hide();
    $('#' + id).show();

    if (id === 'add' || id === 'update') {
        loadEstudiantes(id);
    }
}

var currentBecas = [];
var currentEstudiantes = [];
var currentPage = 1;
var rowsPerPage = 5;

function loadEstudiantes(section) {
    $.get('http://localhost:5022/api/Estudiantes', function(data) {
        currentEstudiantes = data;
        var select = section === 'add' ? $('#addIdEstudiante') : $('#updateIdEstudiante');
        select.empty();
        data.forEach(function(estudiante) {
            select.append(new Option(estudiante.nombres + ' ' + estudiante.apellidos, estudiante.id_estudiante));
        });
    });
}

function displayBecas(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    var paginatedItems = currentBecas.slice(startIndex, endIndex);

    $('#becaList').empty();

    paginatedItems.forEach(function(beca) {
        // Hacer la llamada a la API para obtener el nombre del estudiante
        $.get('http://localhost:5022/api/Estudiantes/' + beca.id_estudiante, function(estudiante) {
            var nombreCompleto = estudiante.nombres + ' ' + estudiante.apellidos;

            $('#becaList').append(`
                <tr>
                    <td>${beca.id_beca}</td>
                    <td>${beca.id_estudiante}</td>
                    <td>${nombreCompleto}</td>
                    <td>${beca.tipo_beca}</td>
                    <td>${beca.monto}</td>
                    <td>${beca.semestre}</td>
                </tr>
            `);
        }).fail(function() {
            $('#becaList').append(`
                <tr>
                    <td>${beca.id_beca}</td>
                    <td>${beca.id_estudiante}</td>
                    <td>No encontrado</td>
                    <td>${beca.tipo_beca}</td>
                    <td>${beca.monto}</td>
                    <td>${beca.semestre}</td>
                </tr>
            `);
        });
    });

    setupPagination(currentBecas.length, page);
}

function setupPagination(totalItems, currentPage) {
    var totalPages = Math.ceil(totalItems / rowsPerPage);
    $('#pagination').empty();

    for (let i = 1; i <= totalPages; i++) {
        var liClass = currentPage === i ? 'page-item active' : 'page-item';
        var pageItem = `<li class="${liClass}"><a class="page-link" href="#" onclick="displayBecas(${i})">${i}</a></li>`;
        $('#pagination').append(pageItem);
    }
}

function getBecas() {
    $.get('http://localhost:5022/api/Becas', function(data) {
        currentBecas = data.sort((a, b) => b.id_beca - a.id_beca); // Ordenar por id_beca de forma descendente

        if (data.length) {
            displayBecas(1);
            $('#errorMessage').hide();
        } else {
            $('#errorMessage').show().text('No hay becas disponibles');
        }
    });
}
/*
function getBecaById() {
    var id = $('#searchId').val().trim();
    if (!id) {
        getBecas();
        return;
    }

    $.get('http://localhost:5022/api/Becas/' + id, function(data) {
        currentBecas = [data].sort((a, b) => b.id_beca - a.id_beca); // Ordenar por id_beca de forma descendente
        displayBecas(1);
    }).fail(function() {
        $('#errorMessage').show().text('Beca no encontrada');
    });
}*/

function getBecaByEstudianteId() {
    var id = $('#searchId').val().trim();
    if (!id) {
        getBecas();
        return;
    }
    $.get('http://localhost:5022/api/Becas/Estudiante/' + id, function(data) {
        currentBecas = data.sort((a, b) => b.id_beca - a.id_beca); // Ordenar por id_beca de forma descendente
        displayBecas(1);
    }).fail(function() {
        $('#errorMessage').show().text('Beca no encontrada');
    });
}

function addBeca() {
    var id_estudiante = $('#addIdEstudiante').val();
    var tipo_beca = $('#addTipoBeca').val();
    var monto = $('#addMonto').val().trim();
    var semestre = $('#addSemestre').val();

    if (!id_estudiante || !tipo_beca || !monto || !semestre) {
        alert('Por favor complete todos los campos');
        return;
    }

    $.post('http://localhost:5022/api/Becas', {
        id_estudiante: id_estudiante,
        tipo_beca: tipo_beca,
        monto: monto,
        semestre: semestre
    }, function(data) {
        alert('Beca agregada con éxito');
        getBecas();
    });
}

function updateBeca() {
    var id_beca = $('#updateIdBeca').val().trim();
    var id_estudiante = $('#updateIdEstudiante').val();
    var tipo_beca = $('#updateTipoBeca').val();
    var monto = $('#updateMonto').val().trim();
    var semestre = $('#updateSemestre').val();

    if (!id_beca || !id_estudiante || !tipo_beca || !monto || !semestre) {
        alert('Por favor, complete todos los campos');
        return;
    }

    $.ajax({
        url: 'http://localhost:5022/api/Becas/' + id_beca,
        method: 'PUT',
        data: {
            id_beca: id_beca,
            id_estudiante: id_estudiante,
            tipo_beca: tipo_beca,
            monto: monto,
            semestre: semestre
        },
        success: function(result) {
            alert('Beca actualizada con éxito');
            getBecas();
        }
    });
}

function deleteBeca() {
    var id_beca = $('#deleteIdBeca').val().trim();

    if (!id_beca) {
        alert('Por favor, proporcione un ID de Beca');
        return;
    }

    $.ajax({
        url: 'http://localhost:5022/api/Becas/' + id_beca,
        method: 'DELETE',
        success: function(result) {
            alert('Beca eliminada con éxito');
            getBecas();
        }
    });
}

$(document).ready(function() {
    getBecas();
});
