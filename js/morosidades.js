function showSection(id) {
    $('.content-section').hide();
    $('#' + id).show();

    if (id === 'add' || id === 'update') {
        loadEstudiantes(id);
    }
}

var currentMorosidades = [];
var currentEstudiantes = [];
var currentPage = 1;
var rowsPerPage = 20;

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

function displayMorosidades(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    var paginatedItems = currentMorosidades.slice(startIndex, endIndex);

    $('#morosidadList').empty();

    paginatedItems.forEach(function(morosidad) {
        // Hacer la llamada a la API para obtener el nombre del estudiante
        $.get('http://localhost:5022/api/Estudiantes/' + morosidad.id_estudiante, function(estudiante) {
            var nombreCompleto = estudiante.nombres + ' ' + estudiante.apellidos;

            $('#morosidadList').append(`
                <tr>
                    <td>${morosidad.id_morosidad}</td>
                    <td>${morosidad.id_estudiante}</td>
                    <td>${nombreCompleto}</td>
                    <td>${morosidad.semestre}</td>
                    <td>${morosidad.dias_retraso}</td>
                    <td>${morosidad.monto_debido}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="loadMorosidadForUpdate(${morosidad.id_morosidad})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="loadMorosidadForDelete(${morosidad.id_morosidad})">Eliminar</button>
                    </td>
                </tr>
            `);
        }).fail(function() {
            $('#morosidadList').append(`
                <tr>
                    <td>${morosidad.id_morosidad}</td>
                    <td>${morosidad.id_estudiante}</td>
                    <td>No encontrado</td>
                    <td>${morosidad.semestre}</td>
                    <td>${morosidad.dias_retraso}</td>
                    <td>${morosidad.monto_debido}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="loadMorosidadForUpdate(${morosidad.id_morosidad})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="loadMorosidadForDelete(${morosidad.id_morosidad})">Eliminar</button>
                    </td>
                </tr>
            `);
        });
    });

    setupPagination(currentMorosidades.length, page);
}

function setupPagination(totalItems, currentPage) {
    var totalPages = Math.ceil(totalItems / rowsPerPage);
    $('#pagination').empty();

    for (let i = 1; i <= totalPages; i++) {
        var liClass = currentPage === i ? 'page-item active' : 'page-item';
        var pageItem = `<li class="${liClass}"><a class="page-link" href="#" onclick="displayMorosidades(${i})">${i}</a></li>`;
        $('#pagination').append(pageItem);
    }
}

function getMorosidades() {
    $.get('http://localhost:5022/api/Morosidades', function(data) {
        currentMorosidades = data.sort((a, b) => b.id_morosidad - a.id_morosidad); // Ordenar por id_morosidad

        if (data.length) {
            displayMorosidades(1);
            $('#errorMessage').hide();
        } else {
            $('#errorMessage').show().text('No hay morosidades disponibles');
        }
    });
}

function getMorosidadByEstudianteId() {
    var id = $('#searchId').val().trim();
    if (!id) {
        getMorosidades();
        return;
    }
    $.get('http://localhost:5022/api/Morosidades/Estudiante/' + encodeURIComponent(id), function(data) {
        currentMorosidades = data.sort((a, b) => b.id_morosidad - a.id_morosidad); // Ordenar por id_morosidad de forma descendente
        displayMorosidades(1);
    }).fail(function() {
        $('#errorMessage').show().text('Morosidad no encontrada');
    });
}

function addMorosidad() {
    var id_estudiante = $('#addIdEstudiante').val();
    var semestre = $('#addSemestre').val();
    var dias_retraso = $('#addDiasRetraso').val().trim();
    var monto_debido = $('#addMontoDebido').val().trim();

    if (!id_estudiante || !semestre || !dias_retraso || !monto_debido) {
        alert('Por favor complete todos los campos');
        return;
    }

    $.post('http://localhost:5022/api/Morosidades', {
        id_estudiante: id_estudiante,
        semestre: semestre,
        dias_retraso: dias_retraso,
        monto_debido: monto_debido
    }, function(data) {
        alert('Morosidad agregada con éxito');
        getMorosidades();
    });
}

function loadMorosidadForUpdate(id) {
    $.get('http://localhost:5022/api/Morosidades/' + id, function(data) {
        if (data) {
            $('#updateIdMorosidad').val(data.id_morosidad);
            $('#updateIdEstudiante').val(data.id_estudiante);
            $('#updateSemestre').val(data.semestre);
            $('#updateDiasRetraso').val(data.dias_retraso);
            $('#updateMontoDebido').val(data.monto_debido);
            showSection('update');
        } else {
            alert('Morosidad no encontrada');
        }
    }).fail(function() {
        alert('Error al obtener los datos de la morosidad');
    });
}

function updateMorosidad() {
    var id_morosidad = $('#updateIdMorosidad').val().trim();
    var id_estudiante = $('#updateIdEstudiante').val();
    var semestre = $('#updateSemestre').val();
    var dias_retraso = $('#updateDiasRetraso').val().trim();
    var monto_debido = $('#updateMontoDebido').val().trim();

    if (!id_morosidad || !id_estudiante || !semestre || !dias_retraso || !monto_debido) {
        alert('Por favor, complete todos los campos');
        return;
    }

    $.ajax({
        url: 'http://localhost:5022/api/Morosidades/' + id_morosidad,
        method: 'PUT',
        data: {
            id_morosidad: id_morosidad,
            id_estudiante: id_estudiante,
            semestre: semestre,
            dias_retraso: dias_retraso,
            monto_debido: monto_debido
        },
        success: function(result) {
            alert('Morosidad actualizada con éxito');
            getMorosidades();
        }
    });
}

function loadMorosidadForDelete(id) {
    $('#deleteIdMorosidad').val(id);
    showSection('delete');
}

function deleteMorosidad() {
    var id_morosidad = $('#deleteIdMorosidad').val().trim();

    if (!id_morosidad) {
        alert('Por favor, proporcione un ID de Morosidad');
        return;
    }

    $.ajax({
        url: 'http://localhost:5022/api/Morosidades/' + id_morosidad,
        method: 'DELETE',
        success: function(result) {
            alert('Morosidad eliminada con éxito');
            getMorosidades();
        }
    });
}

$(document).ready(function() {
    getMorosidades();
});
