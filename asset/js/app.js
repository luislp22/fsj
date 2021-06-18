// PARAMETROS
	const DB_LOCAL = window.indexedDB;
	const DB_NOMBRE = 'FINANCIERA_SANJUAN';
	const DB_VERSION = 1;
	const ALMACENES = new Array("menuUsuario","moduloUsuario","moduloRol","moduloMenu","moduloPermiso","moduloCliente","moduloPrestamo","moduloInversion");
	const BASE_URL = 'http://localhost/NAZCA/NAZCA_API/api_financiera_san_juan/';
	const INTERVALO = 2000;
	const TIPO_RESPUESTA = "json"
	const STORAGE_LOCAL = window.localStorage;

	let token = 'dsad';
	let request  = null;
	let db = null;

// FUNCIONES HELPERS

    function fechaActual(){
      today = new Date()
      return today
    }

    function fecha_format_yyyy_mm_dd(fecha){

      var dd = fecha.getDate()
      var mm = fecha.getMonth()+1 //As January is 0.
      var yyyy = fecha.getFullYear()

      if(dd<10) dd='0'+dd
      if(mm<10) mm='0'+mm
      return (yyyy+'-'+mm+'-'+dd)

    }

    function fecha_format_dd_mm_yyyy(fecha){

      var dd = fecha.getDate()
      var mm = fecha.getMonth()+1 //As January is 0.
      var yyyy = fecha.getFullYear()

      if(dd<10) dd='0'+dd
      if(mm<10) mm='0'+mm
      return (dd+'/'+mm+'/'+yyyy)
    }

    function toDate(dateStr) {
      var parts = dateStr.substring(0, 10).split("-")
      return new Date(parts[0], parts[1] - 1, parts[2])
    }

    function toDate_dd_mm_yyyy(dateStr) {
      var parts = dateStr.substring(0, 10).split("/")
      console.log(parts)
      return new Date(parts[2], parts[1] - 1, parts[0])
    }

// MODELO

	function generaStore(){

		if(!STORAGE_LOCAL.getItem('usuario')){
			usuario = {
				email:'',
				password:'',
				token:'',
				
			}

			STORAGE_LOCAL.setItem('usuario',JSON.stringify(usuario));
		}
	}

	function generateUUID(){
		var d = new Date().getTime();
		
		if( window.performance && typeof window.performance.now === "function" )
		{
			d += performance.now();
		}
		
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
		{
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});

		return uuid;
	}

	function DBGenerar() {
		request = DB_LOCAL.open(DB_NOMBRE,DB_VERSION)
		request.onsuccess = ()=>{

			db = request.result

			controlador()	
		
		}

		request.onupgradeneeded = ()=>{
			db = request.result
			//console.log('CREATE',db)
			$.each(ALMACENES, function(i,v){

				const OBJECTTAREAS = db.createObjectStore(v,{
					keyPath:'id'
				})

			})
		
		}

		request.onerror= (error)=>{
			console.log('Error:', error)
		}

		return true
	}

	function DBEliminar(){

		request = DB_LOCAL.deleteDatabase(DB_NOMBRE);

		request.onerror = function(event) {
		console.log("Error deleting database.");
		};

		request.onsuccess = function(event) {
		console.log("Database deleted successfully");

		console.log(event.result); // should be undefined
		};
		STORAGE_LOCAL.clear()
		location.reload()

	}

	function DBTareasAgregar(tarea){
		var objeto = db.transaction(['tareas'],'readwrite').objectStore('tareas')
		var resulado = objeto.add(tarea)
		resulado.onsuccess = ()=>{
			$('#modalTareaAgregar').modal('hide')
			DBTareasLeer()
		}
		resulado.onerror= (error)=>{
			return false
		}
	}

	function DBTareasLeer(){

		var resulado = db.transaction(['tareas'],'readonly').objectStore('tareas').openCursor()
		tareas = []
		
		resulado.onsuccess = (e)=>{
			const cursor = e.target.result;
			if(cursor){
				tareas.push(cursor.value)
				cursor.continue()
			}
			else{
				cargarTareas(tareas)
			}
		}
		resulado.onerror= (error)=>{
			return false
		}
	}

// INICIO

	$(document).ready(function(){
		
		generaStore()
		DBGenerar()

	})

// CONTROLADOR

	function controlador(modulo = ''){

		switch(modulo){
			case 'moduloLandingPage':{
				moduloLandingPageInicio()
			}
			break
			case 'moduloLogin':{
				moduloLoginInicio()
			}
			break
			case 'moduloMenu':{
				moduloMenuInicio()
			}
			break
			case 'moduloPaginaInicio':{
				moduloPaginaInicio()
			}
			break
			default:{
				moduloLandingPageInicio()
			}
			break
		}

	}

	function controladorDashboar(menu=''){
		modulo = '';
		if(menu!=''){
			modulo = menu.modulo
		}

		switch(modulo){
			case 'moduloUsuario':{
				moduloUsuarioInicio(menu)
			}
			break
			case 'moduloRol':{
				moduloRolInicio(menu)
			}
			break
			case 'moduloCliente':{
				moduloClienteInicio(menu)
			}
			break
			case 'moduloPermiso':{
				moduloPermisoInicio(menu)
			}
			break
			case 'moduloPrestamo':{
				moduloPrestamoInicio(menu)
			}
			break
			case 'moduloMenu':{
				moduloMenuInicio(menu)
			}
			break
			case 'moduloMenuInicio':{
				moduloMenuInicio()
			}
			break
			default:{
				moduloInicioInicio()
			}
			break
		}

	}

// MODULOS

	// MODULO LANDING PAGE

		function moduloLandingPageInicio(){
			$('.seccion').hide()
			$('#moduloLandingPage').show()
			setTimeout(() => {
				moduloLandingPageCargarGraficos()
				moduloLandingPagePrestamoCalcularValor()
			}, 1000);
			
		}

		$('#moduloLandingPageComenzar').click(function(){
			controlador('moduloLogin')
		})

		function moduloLandingPageCargarGraficos() {

			// Load the Visualization API and the corechart package.
			google.charts.load('current', {'packages':['corechart']});

			// Set a callback to run when the Google Visualization API is loaded.
			google.charts.setOnLoadCallback(moduloLandingPageDrawChart);
	
			// Callback that creates and populates a data table,
			// instantiates the pie chart, passes in the data and
			// draws it.
	
		}

		function moduloLandingPageDrawChart(){

			$('#chart_div_inversion').fadeOut()

			// Create the data table.
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Topping');
			data.addColumn('number', '$$$');
			arreglo = [];
			capital = parseFloat($('#moduloLandingPageInversionMonto').val())
			plazo = parseFloat($('#moduloLandingPageInversionPlazo').val())
			interes = 0.05

			tna = 60

			switch(plazo){
				case 30:{interes = (tna/12)/100 }
				break;
				case 60:{interes = (tna/6)/100 }
				break;
				case 90:{interes = (tna/4)/100 }
				break;
				case 180:{interes = (tna/2)/100 }
				break;
			}


			ganancia = capital * interes
			total = capital + ganancia

			$.each(['1','1','1','1','1','1','1','1','1','1','1','1','1'], function(i,v){
				arreglo.push([$('#moduloLandingPageInversionPlazo').val(), total])
				capital = total
				ganancia = capital * interes
				total = capital + ganancia
			});

			data.addRows(arreglo);
	
			// Set chart options
			var options = {'title':'Plazo fijo estimado',
							//'width':400,
							'height':300
						};
	
			// Instantiate and draw our chart, passing in some options.
			var chart_inversion = new google.visualization.ColumnChart(document.getElementById('chart_div_inversion'));
			chart_inversion.draw(data, options);
			$('#chart_div_inversion').fadeIn()
		}

		$('#moduloLandingPageInversionMonto').change(function(){
			moduloLandingPageCargarGraficos()
		})
		
		$('#moduloLandingPageInversionPlazo').change(function(){
			moduloLandingPageCargarGraficos()
		})

		function moduloLandingPagePrestamoCalcularValor(){
			$('#moduloLandingPagePrestamoValorCuota').fadeOut()
			monto  = $('#moduloLandingPagePrestamoMonto').val()
			cuotas = $('#moduloLandingPagePrestamoPlazo').val()
			interes = 1.1
			total = parseFloat(monto*interes/cuotas).toFixed(2)
			$('#moduloLandingPagePrestamoValorCuota').html('$ '+ total)
			$('#moduloLandingPagePrestamoValorCuota').fadeIn()
		}

		$('#moduloLandingPagePrestamoMonto').change(function(){
			moduloLandingPagePrestamoCalcularValor()
		})
		
		$('#moduloLandingPagePrestamoPlazo').change(function(){
			moduloLandingPagePrestamoCalcularValor()
		})

		$('#moduloLandingPageIngresar').click(function(event){
			event.preventDefault()
			controlador('moduloLogin')
		})

	// MODULO LOGIN

		function moduloLoginInicio(){
			// verifico el esado del token

			usuario = JSON.parse(STORAGE_LOCAL.getItem('usuario'))

			if(usuario.token==''){

				$('.seccion').hide()
				$('#moduloLoginMensaje').hide()
				$('.moduloLoginInput').val('')
				
				$('#moduloLogin').show()

				setTimeout(() => {
					$('#moduloLoginCorreo').focus()
				}, 1000);

			}
			else{
				// debo cargar la porada y continuar la sicronización
				controlador('moduloPaginaInicio')
			}


		}

		$('#moduloLoginSalir').click(function(event){
			event.preventDefault()
			controlador('')
		})

		$('#moduloLoginIngresar').click(function(){

			if(
				$('#moduloLoginCorreo').val()=='' 
				|| $('#moduloLoginCorreo').val().indexOf("@") == -1 
				|| $('#moduloLoginCorreo').val().indexOf(".") == -1 
				){

	          $('#moduloLoginCorreo')[0].setCustomValidity('Debe ingresar un email válido.')
	          $('#moduloLoginCorreo')[0].reportValidity()
	          return false

	        }


			if($('#moduloLoginContrasena').val()==''){

	          $('#moduloLoginContrasena')[0].setCustomValidity('Debe completar este campo.')
	          $('#moduloLoginContrasena')[0].reportValidity()
	          return false

	        }

			$('#moduloLoginIngresar').html('Ingresando...')
			$('#moduloLoginIngresar').attr('disabled',true);

			// debo loguearme y obtener el token
			urlCompleta = BASE_URL + 'Api/moduloLoginIngresar';
			
			var formData = new FormData();
			formData.append("email", $('#moduloLoginCorreo').val() )
			formData.append("contrasena", md5($('#moduloLoginContrasena').val()) )

			fetch(urlCompleta,
			{
				body: formData,
				method: "post"
			})
			.then(response => response.json())
			.then((data) => {

				if(data.estado=='ok'){

					console.log(data)

					// debo guardar datos del token a fin de que el usuario pueda trabajar sin problemas
					usuario = JSON.parse(STORAGE_LOCAL.getItem('usuario'))
					usuario.email = $('#moduloLoginCorreo').val()
					usuario.password =  md5($('#moduloLoginContrasena').val())
					usuario.moduloInicio = data.usuario.moduloInicio
					usuario.token = data.token
					STORAGE_LOCAL.setItem('usuario',JSON.stringify(usuario))
					//console.log(data.token.token.length) 

					//guardo los permisos en la base de datos local

					var objeto = db.transaction(['menuUsuario'],'readwrite').objectStore('menuUsuario')
					lista = data.usuario.menuUsuario
					//console.log(menuUsuario)
					lista.forEach( (data) => {
						
						var resulado = objeto.put(data)

						resulado.onsuccess = ()=>{
							//console.log(menu)
						}

						resulado.onerror= (error)=>{
							//console.log("Error: " + error)
						}

					});

					objeto = db.transaction(['moduloUsuario'],'readwrite').objectStore('moduloUsuario')
					lista = data.usuario.moduloUsuario
					lista.forEach( (data) => {
						
						var resulado = objeto.put(data)

						resulado.onsuccess = ()=>{
							//console.log(menu)
						}

						resulado.onerror= (error)=>{
							//console.log("Error: " + error)
						}

					});

					objeto = db.transaction(['moduloRol'],'readwrite').objectStore('moduloRol')
					lista = data.usuario.moduloRol
					lista.forEach( (data) => {
						
						var resulado = objeto.put(data)

						resulado.onsuccess = ()=>{
							//console.log(menu)
						}

						resulado.onerror= (error)=>{
							//console.log("Error: " + error)
						}

					});

					objeto = db.transaction(['moduloMenu'],'readwrite').objectStore('moduloMenu')
					lista = data.usuario.moduloMenu
					lista.forEach( (data) => {
						
						var resulado = objeto.put(data)

						resulado.onsuccess = ()=>{
							//console.log(menu)
						}

						resulado.onerror= (error)=>{
							//console.log("Error: " + error)
						}

					});

					objeto = db.transaction(['moduloPermiso'],'readwrite').objectStore('moduloPermiso')
					lista = data.usuario.moduloPermiso
					lista.forEach( (data) => {
						
						var resulado = objeto.put(data)

						resulado.onsuccess = ()=>{
							//console.log(menu)
						}

						resulado.onerror= (error)=>{
							//console.log("Error: " + error)
						}

					});

					objeto = db.transaction(['moduloPrestamo'],'readwrite').objectStore('moduloPrestamo')
					lista = data.usuario.moduloPrestamo
					lista.forEach( (data) => {
						
						var resulado = objeto.put(data)

						resulado.onsuccess = ()=>{
							//console.log(menu)
						}

						resulado.onerror= (error)=>{
							//console.log("Error: " + error)
						}

					});

					objeto = db.transaction(['moduloCliente'],'readwrite').objectStore('moduloCliente')
					lista = data.usuario.moduloCliente
					lista.forEach( (data) => {
						
						var resulado = objeto.put(data)

						resulado.onsuccess = ()=>{
							//console.log(menu)
						}

						resulado.onerror= (error)=>{
							//console.log("Error: " + error)
						}

					});
	
					controlador('moduloPaginaInicio')
					
					
				}
				else{

					$('#moduloLoginMensaje').show()
					setTimeout(() => {
						$('#moduloLoginMensaje').hide()
					}, 3000);

				}

				$('#moduloLoginIngresar').attr('disabled',false)
				$('#moduloLoginIngresar').html('Ingresar')
				


			})
			.catch(function(error) {
				$('#moduloLoginMensaje').show()
					setTimeout(() => {
						$('#moduloLoginMensaje').hide()
					}, 3000);
				
				$('#moduloLoginIngresar').attr('disabled',false)
				$('#moduloLoginIngresar').html('Ingresar')

				console.log('Hubo un problema con la petición Fetch:' + error.message)
				$('#modulologinMensaje').show()
				setTimeout(() => {
					$('#modulologinMensaje').fadeOut()
				}, 3000);
				$('#modulologinIngresar').attr('disabled',false)
				$('#modulologinIngresar').html('Ingresar')

			});

		})

	// MODULO PAGINA INICIO

		function moduloPaginaInicio(){
			$('.seccion').hide()
			$('#moduloPaginaInicio').show()

			//debo recorrer el menu del usuario
			var resulado_permiso = db.transaction(['menuUsuario'],'readonly').objectStore('menuUsuario').openCursor()
			lista = []
			
			resulado_permiso.onsuccess = (e)=>{
				const cursor = e.target.result;
				if(cursor){
					lista.push(cursor.value)	
					cursor.continue()
				}
				else{
					lista.sort((a, b) => a.orden < b.orden ? -1 : (a.orden > b.orden ? 1 : 0))
					//console.log(lista)
					moduloPaginaInicioCargarMenuLateral(lista)
				}
			}
			resulado_permiso.onerror= (error)=>{
				return false
			}

		}

		$('#moduloPaginaInicioSalir').click(function(event){
			event.preventDefault()
			DBEliminar()
		})

		function moduloPaginaInicioCargarMenuLateral(menuUsuario){

			usuario = JSON.parse(STORAGE_LOCAL.getItem('usuario'))

			listaFinal = ``
			lista = ``
			inicio = ``
			menuElegido = ``
			menuUsuario.forEach( (menu) => {
						
				lista += `<li 
					data-link="${menu.modulo}" 
					data-menu="${menu.id}" 
					class=" link link_lateral list-group-item">
					<h6>${menu.nombre}</h6>
					</li>`

				if(usuario.moduloInicio == menu.modulo){

					inicio = `<li 
						data-link="${menu.modulo}" 
						data-menu="${menu.id}" 
						class=" link link_lateral list-group-item">
						<h6>Inicio</h6>
						</li>`

					menuElegido = menu

				}

			});

			listaFinal = inicio + lista

			$('#moduloPaginaInicioMenuLateral').html(listaFinal)

			controladorDashboar(menuElegido)

		}

		$(document).on('click','#moduloPaginaInicioBotonMenu', function(){
			
			opcion = $(this).attr('data-opcion')

			if(opcion=='visible'){

				$(this).attr('data-opcion','oculto')
				$('#moduloPaginaInicioMenuLateral').hide()
				$('#moduloPaginaInicioBody').removeClass( 'col-sm-10 col-md-10 col-lg-11' )
				$('#moduloPaginaInicioBody').addClass( 'col-sm-12 col-md-12 col-lg-12' )

			}
			else{

				$(this).attr('data-opcion','visible')
				$('#moduloPaginaInicioBody').removeClass( 'col-sm-12 col-md-12 col-lg-12' )
				$('#moduloPaginaInicioBody').addClass( 'col-sm-10 col-md-10 col-lg-11' )
				$('#moduloPaginaInicioMenuLateral').show()

			}

		})

		$(document).on('click','.link_lateral',function(){

			link = $(this).attr('data-link')
			menu = $(this).attr('data-menu')

			//debo recorrer el menu del usuario
			var resulado_permiso = db.transaction(['menuUsuario'],'readonly').objectStore('menuUsuario').get(menu)
			
			resulado_permiso.onsuccess = (event)=>{			
				controladorDashboar(event.target.result)
			}
			resulado_permiso.onerror= (error)=>{
				console.log(error)
				controladorDashboar()
			}

		})
		
	// MODULO INICIO

		function moduloInicioInicio(){
			$('.dashboard').hide()
			$('#moduloInicio').show()
		}

	// MODULO ROL

		function moduloRolInicio(menu=''){
			
			if(menu==''){
				controladorDashboar()
			}
			else{

				$('.dashboard').hide()
				$('#moduloRol').show()

				//debo recorrer la colección de usuarios
				var resulado_permiso = db.transaction(['moduloRol'],'readonly').objectStore('moduloRol').openCursor()
				lista = []
				
				resulado_permiso.onsuccess = (e)=>{
					const cursor = e.target.result;
					if(cursor){
						lista.push(cursor.value)	
						cursor.continue()
					}
					else{
						lista.sort((a, b) => a.orden < b.orden ? -1 : (a.orden > b.orden ? 1 : 0))
						//console.log(lista)
						moduloRolInicioCargar(lista,menu)
						//controladorDashboar()
					}
				}
				resulado_permiso.onerror= (error)=>{
					return false
				}

			}

		}

		function moduloRolInicioCargar(datos,menu){

			//obtengo los permisos
			//permisoAgregar
			//permisoEditar
			//permisoEliminar
			//permisoVer

			if( menu.permisoVer == 1 ){

				$('#moduloRolBuscar').show()
				$('#moduloRolActualizar').show()

			}
			else{

				$('#moduloRolBuscar').hide()
				$('#moduloRolActualizar').hide()

			}

			if( menu.permisoAgregar == 1 ){

				$('#moduloRolAgregar').show()

			}
			else{

				$('#moduloRolAgregar').hide()

			}

			lista = ``
			lista += `<thead>`
			lista += `<tr>`
			lista += `<th>Nombre</th>`
			lista += `<th>Detalle</th>`
			lista += `<th>ModuloInicio</th>`

			if( menu.permisoEditar == 1 || menu.permisoEliminar == 1 ){

				lista += `<th class="text-right">Accion</th>`
			
			}

			lista += `</tr>`
			lista += `</thead>`

			lista +=`</tbody>`

			if( menu.permisoVer == 1 ){

					datos.forEach( (dato) => {
								
						lista += `<tr class="moduloRolFila">`  
						lista += `<td>${dato.nombre}</td>`
						lista += `<td>${dato.detalle}</td>`
						lista += `<td>${dato.moduloInicio}</td>`

						if(menu.permisoEditar == 1 || menu.permisoEliminar == 1){

							lista += `<td class="text-right">`
							
							if( menu.permisoEditar == 1 ){

								lista += `<i data-id="${dato.id}" class="link moduloRolVer text-primary fas fa-eye ml-2" title="Detalle" ></i>`
								lista += `<i data-id="${dato.id}" class="link moduloRolEditar text-primary fas fa-pencil ml-2" title="Editar" ></i>`

							}

							if( menu.permisoEliminar == 1 ){

								lista += `<i data-id="${dato.id}" class="link moduloRolEliminar text-danger fas fa-trash ml-2" title="Elimar" ></i>`

							}

							lista += `</td>`

						}

						lista += `</tr>`

					});

			}

			lista += `</tbody>`

			$('#moduloRolTabla').html(lista)

		}

		$('#moduloRolBuscar').keyup(function(){

			var buscar = $('#moduloRolBuscar').val().toLowerCase().trim();

			$('.moduloRolFila').each(function () {

				texto = this.innerText.toLowerCase().trim()

				var ocultar = !(texto.indexOf(buscar) > -1)

				this.hidden = ocultar

			});
		
		})

		$(document).on( 'click' , '.moduloRolVer' , function(){

			
			id = $(this).attr('data-id')

			//debo recorrer el menu del usuario
			var resulado = db.transaction(['moduloRol'],'readonly').objectStore('moduloRol').get(id)
			
			resulado.onsuccess = (event)=>{		

				dato = event.target.result
				
				$('#modalRolVerTitulo').html(dato.nombre)
				$('#modalRolVerNombre').html(dato.nombre)
				$('#modalRolVerModuloInicio').html(dato.moduloInicio)
				$('#modalRolVerDetalle').html(dato.detalle)

				$('#modalRolVer').modal('show')

			}

			resulado.onerror= (error)=>{

				console.log(error)

			}

		})

	// MODULO USUARIO

		function moduloUsuarioInicio(menu=''){
			
			if(menu==''){
				controladorDashboar()
			}
			else{

				$('.dashboard').hide()
				$('#moduloUsuario').show()

				//debo recorrer la colección de usuarios
				var resulado_permiso = db.transaction(['moduloUsuario'],'readonly').objectStore('moduloUsuario').openCursor()
				lista = []
				
				resulado_permiso.onsuccess = (e)=>{
					const cursor = e.target.result;
					if(cursor){
						lista.push(cursor.value)	
						cursor.continue()
					}
					else{
						lista.sort((a, b) => a.orden < b.orden ? -1 : (a.orden > b.orden ? 1 : 0))
						//console.log(lista)
						moduloUsuarioInicioCargar(lista,menu)
						//controladorDashboar()
					}
				}
				resulado_permiso.onerror= (error)=>{
					return false
				}

			}

		}

		function moduloUsuarioInicioCargar(datos,menu){

			//obtengo los permisos
			//permisoAgregar
			//permisoEditar
			//permisoEliminar
			//permisoVer

			if( menu.permisoVer == 1 ){

				$('#moduloUsuarioBuscar').show()
				$('#moduloUsuarioActualizar').show()

			}
			else{

				$('#moduloUsuarioBuscar').hide()
				$('#moduloUsuarioActualizar').hide()

			}

			if( menu.permisoAgregar == 1 ){

				$('#moduloUsuarioAgregar').show()

			}
			else{

				$('#moduloUsuarioAgregar').hide()

			}

			lista = ``
			lista += `<thead>`
			lista += `<tr>`
			lista += `<th>Apellido</th>`
			lista += `<th>Nombre</th>`
			lista += `<th>DNI</th>`
			lista += `<th>Email</th>`
			lista += `<th>Rol</th>`

			if( menu.permisoEditar == 1 || menu.permisoEliminar == 1 ){

				lista += `<th class="text-right">Accion</th>`
			
			}

			lista += `</tr>`
			lista += `</thead>`

			lista +=`</tbody>`

			if( menu.permisoVer == 1 ){

					datos.forEach( (dato) => {
								
						lista += `<tr class="moduloUsuarioFila">`  
						lista += `<td>${dato.apellido}</td>`
						lista += `<td>${dato.nombre}</td>`
						lista += `<td>${dato.dni}</td>`
						lista += `<td>${dato.email}</td>`
						lista += `<td>${dato.rolNombre}</td>`

						if(menu.permisoEditar == 1 || menu.permisoEliminar == 1){

							lista += `<td class="text-right">`
							
							if( menu.permisoEditar == 1 ){

								lista += `<i class="link moduloUsuarioRenovar text-primary fas fa-redo ml-2" title="Renovar contraseña" ></i>`
								lista += `<i data-id="${dato.id}" class="link moduloUsuarioVer text-primary fas fa-eye ml-2" title="Detalle" ></i>`
								lista += `<i data-id="${dato.id}" class="link moduloUsuarioEditar text-primary fas fa-pencil ml-2" title="Editar" ></i>`

							}

							if( menu.permisoEliminar == 1 ){

								lista += `<i data-id="${dato.id}" class="link moduloUsuarioEliminar text-danger fas fa-trash ml-2" title="Elimar" ></i>`

							}

							lista += `</td>`

						}

						lista += `</tr>`

					});

			}

			lista += `</tbody>`

			$('#moduloUsuarioTabla').html(lista)

		}

		$('#moduloUsuarioBuscar').keyup(function(){

			var buscar = $('#moduloUsuarioBuscar').val().toLowerCase().trim();

			$('.moduloUsuarioFila').each(function () {

				texto = this.innerText.toLowerCase().trim()

				var ocultar = !(texto.indexOf(buscar) > -1)

				this.hidden = ocultar

			});

		})

		$(document).on( 'click' , '.moduloUsuarioVer' , function(){

			
			id = $(this).attr('data-id')

			//debo recorrer el menu del usuario
			var resulado = db.transaction(['moduloUsuario'],'readonly').objectStore('moduloUsuario').get(id)
			
			resulado.onsuccess = (event)=>{		

				dato = event.target.result
				
				$('#modalUsuarioVerTitulo').html(dato.apellido + ', ' + dato.nombre)
				$('#modalUsuarioVerDNI').html(dato.dni)
				$('#modalUsuarioVerApellido').html(dato.apellido)
				$('#modalUsuarioVerNombre').html(dato.nombre)
				$('#modalUsuarioVerEmail').html(dato.email)
				$('#modalUsuarioVerRol').html(dato.rolNombre)

				$('#modalUsuarioVer').modal('show')

			}

			resulado.onerror= (error)=>{

				console.log(error)

			}

		})

	// MODULO MENU

		function moduloMenuInicio(menu=''){
			
			if(menu==''){
				controladorDashboar()
			}
			else{

				$('.dashboard').hide()
				$('#moduloMenu').show()

				//debo recorrer la colección de usuarios
				var resulado_permiso = db.transaction(['moduloMenu'],'readonly').objectStore('moduloMenu').openCursor()
				lista = []
				
				resulado_permiso.onsuccess = (e)=>{
					const cursor = e.target.result;
					if(cursor){
						lista.push(cursor.value)	
						cursor.continue()
					}
					else{
						lista.sort((a, b) => a.orden < b.orden ? -1 : (a.orden > b.orden ? 1 : 0))
						//console.log(lista)
						moduloMenuInicioCargar(lista,menu)
						//controladorDashboar()
					}
				}
				resulado_permiso.onerror= (error)=>{
					return false
				}

			}

		}

		function moduloMenuInicioCargar(datos,menu){

			//obtengo los permisos
			//permisoAgregar
			//permisoEditar
			//permisoEliminar
			//permisoVer

			if( menu.permisoVer == 1 ){

				$('#moduloMenuBuscar').show()
				$('#moduloMenuActualizar').show()

			}
			else{

				$('#moduloMenuBuscar').hide()
				$('#moduloMenuActualizar').hide()

			}

			if( menu.permisoAgregar == 1 ){

				$('#moduloMenuAgregar').show()

			}
			else{

				$('#moduloMenuAgregar').hide()

			}

			lista = ``
			lista += `<thead>`
			lista += `<tr>`
			lista += `<th>Nombre</th>`
			lista += `<th>Modulo</th>`
			lista += `<th>Detalle</th>`
			lista += `<th>Orden</th>`

			if( menu.permisoEditar == 1 || menu.permisoEliminar == 1 ){

				lista += `<th class="text-right">Accion</th>`
			
			}

			lista += `</tr>`
			lista += `</thead>`

			lista +=`</tbody>`

			if( menu.permisoVer == 1 ){

					datos.forEach( (dato) => {
								
						lista += `<tr class="moduloMenuFila">`  
						lista += `<td>${dato.nombre}</td>`
						lista += `<td>${dato.modulo}</td>`
						lista += `<td>${dato.detalle}</td>`
						lista += `<td>${dato.orden}</td>`

						if(menu.permisoEditar == 1 || menu.permisoEliminar == 1){

							lista += `<td class="text-right">`
							
							if( menu.permisoEditar == 1 ){

								lista += `<i data-id="${dato.id}" class="link moduloMenuVer text-primary fas fa-eye ml-2" title="Ver" ></i>`
								lista += `<i data-id="${dato.id}" class="link moduloMenuEditar text-primary fas fa-pencil ml-2" title="Editar" ></i>`

							}

							if( menu.permisoEliminar == 1 ){

								lista += `<i data-id="${dato.id}" class="link moduloMenuEliminar text-danger fas fa-trash ml-2" title="Elimar" ></i>`

							}

							lista += `</td>`

						}

						lista += `</tr>`

					});

			}

			lista += `</tbody>`

			$('#moduloMenuTabla').html(lista)

		}

		$('#moduloMenuBuscar').keyup(function(){

			var buscar = $('#moduloMenuBuscar').val().toLowerCase().trim();

			$('.moduloMenuFila').each(function () {

				texto = this.innerText.toLowerCase().trim()

				var ocultar = !(texto.indexOf(buscar) > -1)

				this.hidden = ocultar

			});

		})

		$(document).on( 'click' , '.moduloMenuVer' , function(){

			
			id = $(this).attr('data-id')

			//debo recorrer el menu del usuario
			var resulado = db.transaction(['moduloMenu'],'readonly').objectStore('moduloMenu').get(id)
			
			resulado.onsuccess = (event)=>{		

				dato = event.target.result
				
				$('#modalMenuVerTitulo').html(dato.nombre)
				$('#modalMenuVerNombre').html(dato.nombre)
				$('#modalMenuVerModulo').html(dato.modulo)
				$('#modalMenuVerDetalle').html(dato.detalle)

				$('#modalMenuVer').modal('show')

			}

			resulado.onerror= (error)=>{

				console.log(error)

			}

		})

	// MODULO PERMISO

		function moduloPermisoInicio(menu=''){
			
			if(menu==''){
				controladorDashboar()
			}
			else{

				$('.dashboard').hide()
				$('#moduloPermiso').show()

				//debo recorrer la colección de usuarios
				var resulado_permiso = db.transaction(['moduloPermiso'],'readonly').objectStore('moduloPermiso').openCursor()
				lista = []
				
				resulado_permiso.onsuccess = (e)=>{
					const cursor = e.target.result;
					if(cursor){
						lista.push(cursor.value)	
						cursor.continue()
					}
					else{
						lista.sort((a, b) => a.orden < b.orden ? -1 : (a.orden > b.orden ? 1 : 0))
						//console.log(lista)
						moduloPermisoInicioCargar(lista,menu)
						//controladorDashboar()
					}
				}
				resulado_permiso.onerror= (error)=>{
					return false
				}

			}

		}

		function moduloPermisoInicioCargar(datos,menu){

			//obtengo los permisos
			//permisoAgregar
			//permisoEditar
			//permisoEliminar
			//permisoVer

			if( menu.permisoVer == 1 ){

				$('#moduloPermisoBuscar').show()
				$('#moduloPermisoActualizar').show()

			}
			else{

				$('#moduloPermisoBuscar').hide()
				$('#moduloPermisoActualizar').hide()

			}

			if( menu.permisoAgregar == 1 ){

				$('#moduloPermisoAgregar').show()

			}
			else{

				$('#moduloPermisoAgregar').hide()

			}

			lista = ``
			lista += `<thead>`
			lista += `<tr>`
			lista += `<th>Rol</th>`
			lista += `<th>Menu</th>`
			lista += `<th>Ver</th>`
			lista += `<th>Agregar</th>`
			lista += `<th>Editar</th>`
			lista += `<th>Eliminar</th>`

			if( menu.permisoEditar == 1 || menu.permisoEliminar == 1 ){

				lista += `<th class="text-right">Accion</th>`
			
			}

			lista += `</tr>`
			lista += `</thead>`

			lista +=`</tbody>`

			if( menu.permisoVer == 1 ){

					datos.forEach( (dato) => {
								
						lista += `<tr class="moduloPermisoFila">`  
						lista += `<td>${dato.rolNombre}</td>`
						lista += `<td>${dato.menuNombre}</td>`
						lista += `<td>${dato.permisoVer}</td>`
						lista += `<td>${dato.permisoAgregar}</td>`
						lista += `<td>${dato.permisoEditar}</td>`
						lista += `<td>${dato.permisoEliminar}</td>`

						if(menu.permisoEditar == 1 || menu.permisoEliminar == 1){

							lista += `<td class="text-right">`
							
							if( menu.permisoEditar == 1 ){

								lista += `<i data-id="${dato.id}" class="link moduloPermisoVer text-primary fas fa-eye ml-2" title="Detalle" ></i>`
								lista += `<i data-id="${dato.id}" class="link moduloPermisoEditar text-primary fas fa-pencil ml-2" title="Editar" ></i>`

							}

							if( menu.permisoEliminar == 1 ){

								lista += `<i data-id="${dato.id}" class="link moduloPermisoEliminar text-danger fas fa-trash ml-2" title="Elimar" ></i>`

							}

							lista += `</td>`

						}

						lista += `</tr>`

					});

			}

			lista += `</tbody>`

			$('#moduloPermisoTabla').html(lista)

		}

		$('#moduloPermisoBuscar').keyup(function(){

			var buscar = $('#moduloPermisoBuscar').val().toLowerCase().trim();

			$('.moduloPermisoFila').each(function () {

				texto = this.innerText.toLowerCase().trim()

				var ocultar = !(texto.indexOf(buscar) > -1)

				this.hidden = ocultar

			});

			
		})

		$(document).on( 'click' , '.moduloPermisoVer' , function(){

			
			id = $(this).attr('data-id')

			//debo recorrer el menu del usuario
			var resulado = db.transaction(['moduloPermiso'],'readonly').objectStore('moduloPermiso').get(id)
			
			resulado.onsuccess = (event)=>{		

				dato = event.target.result
				
				$('#modalPermisoVerTitulo').html('Detalle del permiso')
				$('#modalPermisoVerRol').html(dato.rolNombre)
				$('#modalPermisoVerMenu').html(dato.menuNombre)

				$('#modalPermisoVer').modal('show')

			}

			resulado.onerror= (error)=>{

				console.log(error)

			}

		})


	// MODULO CLIENTE

		function moduloClienteInicio(menu=''){
			
			if(menu==''){
				controladorDashboar()
			}
			else{

				$('.dashboard').hide()
				$('#moduloCliente').show()

				//debo recorrer la colección de usuarios
				var resulado_permiso = db.transaction(['moduloCliente'],'readonly').objectStore('moduloCliente').openCursor()
				lista = []
				
				resulado_permiso.onsuccess = (e)=>{
					const cursor = e.target.result;
					if(cursor){
						lista.push(cursor.value)	
						cursor.continue()
					}
					else{
						lista.sort((a, b) => a.orden < b.orden ? -1 : (a.orden > b.orden ? 1 : 0))
						//console.log(lista)
						moduloClienteInicioCargar(lista,menu)
						//controladorDashboar()
					}
				}
				resulado_permiso.onerror= (error)=>{
					return false
				}

			}

		}

		function moduloClienteInicioCargar(datos,menu){

			console.log(datos)
			console.log(menu)

			//obtengo los permisos
			//permisoAgregar
			//permisoEditar
			//permisoEliminar
			//permisoVer

			if( menu.permisoVer == 1 ){

				$('#moduloClienteBuscar').show()
				$('#moduloClienteActualizar').show()

			}
			else{

				$('#moduloClienteBuscar').hide()
				$('#moduloClienteActualizar').hide()

			}

			if( menu.permisoAgregar == 1 ){

				$('#moduloClienteAgregar').show()

			}
			else{

				$('#moduloClienteAgregar').hide()

			}

			lista = ``
			lista += `<thead>`
			lista += `<tr>`
			lista += `<th>DNI</th>`
			lista += `<th>CUIL</th>`
			lista += `<th>Apellido</th>`
			lista += `<th>Nombre</th>`
			lista += `<th>Teléfono</th>`
			lista += `<th>Domicilio</th>`
			lista += `<th>Detalle</th>`

			if( menu.permisoEditar == 1 || menu.permisoEliminar == 1 ){

				lista += `<th class="text-right">Accion</th>`
			
			}

			lista += `</tr>`
			lista += `</thead>`

			lista +=`</tbody>`

			if( menu.permisoVer == 1 ){

					datos.forEach( (dato) => {
								
						lista += `<tr class="moduloClienteFila">`  
						lista += `<td>${dato.dni}</td>`
						lista += `<td>${dato.cuil}</td>`
						lista += `<td>${dato.apellido}</td>`
						lista += `<td>${dato.nombre}</td>`
						lista += `<td>${dato.telefono}</td>`
						lista += `<td>${dato.domicilio}</td>`
						lista += `<td>${dato.detalle}</td>`

						if(menu.permisoEditar == 1 || menu.permisoEliminar == 1){

							lista += `<td class="text-right">`
							
							if( menu.permisoEditar == 1 ){

								lista += `<i data-id="${dato.id}" class="link moduloClienteVer text-primary fas fa-eye ml-2" title="Detalle" ></i>`
								lista += `<i data-id="${dato.id}" class="link moduloClienteEditar text-primary fas fa-pencil ml-2" title="Editar" ></i>`

							}

							if( menu.permisoEliminar == 1 ){

								lista += `<i data-id="${dato.id}" class="link moduloClienteEliminar text-danger fas fa-trash ml-2" title="Elimar" ></i>`

							}

							lista += `</td>`

						}

						lista += `</tr>`

					});

			}

			lista += `</tbody>`

			$('#moduloClienteTabla').html(lista)

		}

		$('#moduloClienteBuscar').keyup(function(){

			var buscar = $('#moduloClienteBuscar').val().toLowerCase().trim();

			$('.moduloClienteFila').each(function () {

				texto = this.innerText.toLowerCase().trim()

				var ocultar = !(texto.indexOf(buscar) > -1)

				this.hidden = ocultar

			});

			
		})

		$(document).on( 'click' , '.moduloClienteVer' , function(){

			
			id = $(this).attr('data-id')

			//debo recorrer el menu del usuario
			var resulado = db.transaction(['moduloCliente'],'readonly').objectStore('moduloCliente').get(id)
			
			resulado.onsuccess = (event)=>{		

				dato = event.target.result
				
				$('#modalClienteVerTitulo').html(dato.apellido + ', ' + dato.nombre)
				$('#modalClienteVerApellido').html(dato.apellido)
				$('#modalClienteVerNombre').html(dato.nombre)
				$('#modalClienteVerDNI').html(dato.dni)
				$('#modalClienteVerCuil').html(dato.cuil)
				$('#modalClienteVerTelefono').html(dato.telefono)
				$('#modalClienteVerDomicilio').html(dato.domicilio)
				$('#modalClienteVerDetalle').html(dato.detalle)

				$('#modalClienteVer').modal('show')

			}

			resulado.onerror= (error)=>{

				console.log(error)

			}

		})

	// MODULO PRESTAMO

		function moduloPrestamoInicio(menu=''){
			
			if(menu==''){
				controladorDashboar()
			}
			else{

				$('.dashboard').hide()
				$('#moduloPrestamo').show()

				//debo recorrer la colección de usuarios
				var resulado_permiso = db.transaction(['moduloPrestamo'],'readonly').objectStore('moduloPrestamo').openCursor()
				lista = []
				
				resulado_permiso.onsuccess = (e)=>{
					const cursor = e.target.result;
					if(cursor){
						lista.push(cursor.value)	
						cursor.continue()
					}
					else{
						lista.sort((a, b) => a.orden < b.orden ? -1 : (a.orden > b.orden ? 1 : 0))
						//console.log(lista)
						moduloPrestamoInicioCargar(lista,menu)
						//controladorDashboar()
					}
				}
				resulado_permiso.onerror= (error)=>{
					return false
				}

			}

		}

		function moduloPrestamoInicioCargar(datos,menu){

			//obtengo los permisos
			//permisoAgregar
			//permisoEditar
			//permisoEliminar
			//permisoVer

			if( menu.permisoVer == 1 ){

				$('#moduloPrestamoBuscar').show()
				$('#moduloPrestamoActualizar').show()

			}
			else{

				$('#moduloPrestamoBuscar').hide()
				$('#moduloPrestamoActualizar').hide()

			}

			if( menu.permisoAgregar == 1 ){

				$('#moduloPrestamoAgregar').show()

			}
			else{

				$('#moduloPrestamoAgregar').hide()

			}

			lista = ``
			lista += `<thead>`
			lista += `<tr>`
			lista += `<th>Cliente</th>`
			lista += `<th>Fecha</th>`
			lista += `<th>Importe</th>`
			lista += `<th>Pago Semanal</th>`
			lista += `<th>Interes</th>`
			lista += `<th>Total</th>`

			if( menu.permisoEditar == 1 || menu.permisoEliminar == 1 ){

				lista += `<th class="text-right">Accion</th>`
			
			}

			lista += `</tr>`
			lista += `</thead>`

			lista +=`</tbody>`

			if( menu.permisoVer == 1 ){

					datos.forEach( (dato) => {
								
						lista += `<tr class="moduloPrestamoFila">`  
						lista += `<td>${dato.clienteNombre}</td>`
						lista += `<td>${dato.fechaCreacion}</td>`
						lista += `<td>${dato.importe}</td>`
						lista += `<td>${dato.pagoSemanal}</td>`
						lista += `<td>${dato.interesTotal}</td>`
						lista += `<td>${dato.costoTotal}</td>`

						if(menu.permisoEditar == 1 || menu.permisoEliminar == 1){

							lista += `<td class="text-right">`
							
							if( menu.permisoEditar == 1 ){

								lista += `<i class="link moduloPrestamoEditar text-primary fas fa-pencil ml-2" title="Editar" ></i>`

							}

							if( menu.permisoEliminar == 1 ){

								lista += `<i class="link moduloPrestamoEliminar text-danger fas fa-trash ml-2" title="Elimar" ></i>`

							}

							lista += `</td>`

						}

						lista += `</tr>`

					});

			}

			lista += `</tbody>`

			$('#moduloPrestamoTabla').html(lista)

		}

		$('#moduloPrestamoBuscar').keyup(function(){

			var buscar = $('#moduloPrestamoBuscar').val().toLowerCase().trim();

			$('.moduloPrestamoFila').each(function () {

				texto = this.innerText.toLowerCase().trim()

				var ocultar = !(texto.indexOf(buscar) > -1)

				this.hidden = ocultar

			});

			
		})

