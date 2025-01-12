const messages = {
  pt: {
    translations: {
      signup: {
        title: "Inscribirse",
        toasts: {
          success: "¡Usuario creado exitosamente!",
          fail: "Error al crear el usuario. Verifique la información proporcionada.",
        },
        form: {
          name: "Nombre completo",
          email: "Email",
          password: "Contraseña",
        },
        buttons: {
          submit: "Registro",
          login: "¿Ya tienes una cuenta? Iniciar sesion",
        },
      },
      login: {
        title: "Acceso",
        form: {
          email: "Email",
          password: "Contraseña",
        },
        buttons: {
          submit: "Entrar",
          register: "Regístrate ahora!",
        },
      },
      plans: {
        form: {
          name: "Nombre",
          users: "Usuários",
          connections: "Conexiones",
          campaigns: "Campañas",
          schedules: "Programaciones",
          enabled: "Habilitadas",
          disabled: "Desabilitadas",
          clear: "Cancelar",
          delete: "Eliminar",
          save: "Guardarr",
          yes: "Si",
          no: "No",
          money: "US",
        },
      },
      companies: {
        title: "Registro de empresas",
        form: {
          name: "Nombre de Empresa",
          plan: "Tipo de Plan",
          token: "Token",
          submit: "Registro",
          success: "Empresa creada con éxito!",
        },
      },
      auth: {
        toasts: {
          success: "Inicio de sesión exitoso!",
        },
        token: "Token",
      },
      dashboard: {
        charts: {
          perDay: {
            title: "Citas hoy: ",
          },
        },
      },
      connections: {
        title: "Conexiones",
        toasts: {
          deleted: "La conexión de WhatsApp se eliminó correctamente!",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Está seguro? Esta acción no se puede revertir..",
          disconnectTitle: "Desconectar",
          disconnectMessage:
            "¿Está seguro? Necesitarás escanear el código QR nuevamente..",
        },
        buttons: {
          add: "Agregar WhatsApp",
          disconnect: "Desconectar",
          tryAgain: "Intentar otra vez",
          qrcode: "Codigo QR",
          newQr: "Nuevo Codigo QR",
          connecting: "Conectando",
        },
        toolTips: {
          disconnected: {
            title: "Error al iniciar sesión en WhatsApp",
            content:
              "Asegúrate de que tu teléfono esté conectado a Internet e inténtalo nuevamente o solicita un nuevo código QR",
          },
          qrcode: {
            title: "Esperando la lectura del código QR",
            content:
              "Haz clic en el botón 'CÓDIGO QR' y escanea el código QR con tu teléfono móvil para iniciar la sesión",
          },
          connected: {
            title: "Conexión establecida!",
          },
          timeout: {
            title: "Se perdió la conexión celular",
            content:
              "Asegúrate de que tu teléfono esté conectado a Internet y que WhatsApp esté abierto, o haz clic en el botón Desconectar para obtener un nuevo código QR",
          },
        },
        table: {
          name: "Nombre",
		  number: "Número",
          status: "Status",
          lastUpdate: "Última actualización",
          default: "stándar",
          actions: "Acciones",
          session: "Conectar/Desconectar",
        },
      },
      whatsappModal: {
        title: {
          add: "Adicionar WhatsApp",
          edit: "Editar WhatsApp",
        },		
		 tabs: {
          general: "General",
          messages: "Mensajes",
          assessments: "Calificaciones de Usuarios",
          integrations: "Integraciones",
          schedules: "Horario de Atencion",
		 },
        form: {
          name: "Nombre",
          default: "Estandar",
          sendIdQueue: "Dependencia",
          timeSendQueue: "Redirecionar para dependencia en X minutos",
          queueRedirection: "Redirecionamento de Dependencia",
		  outOfHoursMessage: "Mensaje fuera del horario laboral",
          queueRedirectionDesc: "Seleccione una dependencia para los contactos que no han elegido y serán redirigidos.",
          prompt: "Prompt IA",
          //maxUseBotQueues: "Enviar bot x vezes",
          //timeUseBotQueues: "Intervalo em minutos entre envio de bot",
          expiresTicket: "Cerrar chats abiertos después de x minutos",
          expiresInactiveMessage: "Mensaje de cierre por inactividad",
		  greetingMessage: "Mensaje de saludo",
          complationMessage: "Mensaje de finalización",
		  sendIdQueue: "Dependencias",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "WhatsApp guardado con éxito.",
      },
      qrCode: {
        message: "Escanee el código QR para iniciar la sesión",
      },
      contacts: {
        title: "Contactos",
        toasts: {
          deleted: "Contacto eliminado exitosamente!",
		  deletedAll: "Todos los contactos eliminados correctamente!",
        },
		  searchPlaceholder: "Buscar contacto...",
          confirmationModal: {
          deleteTitle: "Eliminar ",
          deleteAllTitle: "Eliminar todos",
          importTitle: "Importar contatos",
          deleteMessage: "¿Estás seguro de que deseas eliminar este contacto? Se perderán todos los tickets relacionados..",
          deleteAllMessage: "¿Estás seguro de que deseas eliminar todos los contactos? Se perderán todos los tickets relacionados.",
          importMessage: "Quieres importar todos los contactos de",
        },
		confirmationModal:{
			importTitlte: "Importar contatos",
			importMessage: "Esta acción importará los contactos guardados en la libreta de direcciones de WhatsApp. Algunos dispositivos o configuraciones de privacidad podrían no permitir esta funcionalidad. Verifique el resultado en 1 hora.",
			deleteTitle:"Eliminar",
			deleteMessage:"¿Estás seguro de que deseas eliminar este contacto? Se perderán todas los chats relacionadas..",
		},
        buttons: {
          import: "Importar Contatos",
		  importSheet: "Import. Excel",
          add: "Añadir un Contacto",
          export: "Exportar Contatos",
          delete: "Excluir Todos Contatos"
        },
        table: {
          name: "Nombre",
          whatsapp: "WhatsApp",
          email: "Email",
          actions: "Accion",
        },
      },
      queueIntegrationModal: {
        title: {
          add: "Agregar Proyecto",
          edit: "Editar Proyecto",
        },
        form: {
          id: "ID",
          type: "Tipo",
          name: "Nombre",
          projectName: "Nombre del Proyecto",
          language: "Idioma",
          jsonContent: "JsonContent",
          urlN8N: "URL",
          typebotSlug: "Typebot - Slug",
          typebotExpires: "Tiempo en minutos para que expire una conversación",
          typebotKeywordFinish: "Palabra para finalizar el ticket",
          typebotKeywordRestart: "Palabra para reiniciar el flujo",
          typebotRestartMessage: "Mensaje para reiniciar la conversación",
          typebotUnknownMessage: "Mensaje de opción no válida",
          typebotDelayMessage: "Intervalo (ms) entre mensajes",   
        },
        buttons: {
          okAdd: "Añadir",
          okEdit: "Guardar",
          cancel: "Cancelar",
          test: "Testear Bot",
        },
        messages: {
          testSuccess: "Integración probada con éxito!",
          addSuccess: "Iintegración agregada exitosamente.",
          editSuccess: "Integración editada exitosamente.",
        },
      },
	  sideMenu: {
            name: "Menu Lateral Inicial",
            note: "Se habilitado, o menu lateral irá iniciar fechado",
            options: {
              enabled: "Aberto",
              disabled: "Fechado",
            },
          },
      promptModal: {
        form: {
          name: "Nombre",
          prompt: "Prompt IA",
          voice: "Voz",
          max_tokens: "Máximo de tokens por respuesta",
          temperature: "Temperatura",
          apikey: "API Key",
          max_messages: "Máximo de mensajes en el historial",
          voiceKey: "Clave API de voz",
          voiceRegion: "Región de voz",
        },
        success: "Promt guardado exitosamente!",
        title: {
          add: "Agregar Prompt",
          edit: "Editar Prompt",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
      },
      prompts: {
        title: "Prompts IA",
        table: {
          name: "Nombre",
          queue: "Whatsapp/Dependencia",
          max_tokens: "Tokens de respuesta máxima",
          actions: "Acciones",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Está seguro? Esta acción no se puede revertir.!",
        },
        buttons: {
          add: "Añadir Prompt",
        },
      },
      contactModal: {
        title: {
          add: "Añadir Contacto",
          edit: "Editar Contato",
        },
        form: {
          mainInfo: "Datos del Contacto",
          extraInfo: "Informaciones adicionales",
          name: "Nombre",
          number: "Numero de Whatsapp",
          email: "Email",
          extraName: "Nombre del campo",
          extraValue: "Descripcion",
          whatsapp: "Conexión de origen: "
        },
        buttons: {
          addExtraInfo: "Añadir Informacion",
          okAdd: "Añadir",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Contacto guardado con exito.",
      },
      queueModal: {
        title: {
          add: "Añadir Dependencia",
          edit: "Editar Dependencia",
        },
		confirmationModal: {
		  "deleteTitle": "Eliminar",
		},
        form: {
          name: "Nombre",
          color: "Corlor Dependencia",
          greetingMessage: "Mensaje de saludo",
          complationMessage: "Mensaje de finalización",
          outOfHoursMessage: "Mensaje fuera del horario laboral",
          ratingMessage: "Mensaje de evaluación",
          token: "Token",
          orderQueue: "Numero pNúmero de posición de la Dependencia (Bot)",
          integrationId: "Integración",
        },
        buttons: {
          okAdd: "Añadir",
          okEdit: "Guardarr",
          cancel: "Cancelar",
		  attach: "Añadir Archivo",
        },
      },
      userModal: {
        title: {
          add: "Añadir Usuario",
          edit: "Editar Usuario",
        },
        form: {
          name: "Nombre",
          email: "Email",
          password: "Contraseña",
          profile: "Perfil",
          whatsapp: "Conexion de Whatsapp",

          allTicket: "Ver las Dependencias [Invisibe]",
          allTicketEnabled: "Habilitado",
          allTicketDesabled: "Desabilitado",
        },
        buttons: {
          okAdd: "Añadir",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Usuario guardado exitosamente.",
      },
      scheduleModal: {
        title: {
          add: "Nuevo Recordatorio",
          edit: "Editar Recordatorio",
        },
        form: {
          body: "Recordatorio",
          contact: "Contacto",
          sendAt: "Fecha del Recordatorio",
          sentAt: "Fecha de envio",
        },
        buttons: {
          okAdd: "Añadir",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Recordatorio agregado con exito.",
      },
      tagModal: {
        title: {
          add: "Nueva Tag",
          edit: "Editar Tag",
        },
        form: {
          name: "Nombre",
          color: "Corlor Tag",
        },
        buttons: {
          okAdd: "Añadir",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Etiqueta guardada exitosamente.",
      },
      chat: {
        noTicketMessage: "Seleccione un ticket para comenzar a chatear.",
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "ARRASTRE Y SUELTE ARCHIVOS EN EL CAMPO DE ABAJO",
          titleFileList: "Lista de archivo(s)"
        },
      },
      ticketsManager: {
        buttons: {
          newTicket: "Nuevo",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Dependencias",
      },
      tickets: {
        toasts: {
          deleted: "El servicio en el que estabas ha sido eliminado.",
        },
        notification: {
          message: "Mensaje de",
        },
        tabs: {
          open: { title: "Chat Abiertos" },
          closed: { title: "Chat Resueltos" },
          search: { title: "Buscar Chat" },
        },
        search: {
          placeholder: "Buscar Chat - Nombre, Numero, palabra clave",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Escriba para buscar usuarios",
        fieldQueueLabel: "Transferir para Dependencia",
        fieldQueuePlaceholder: "Seleccione una Dependencia",
        noOptions: "No se encontró ningún usuario con ese nombre",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "Chats en espera",
        assignedHeader: "Atendiendo Chats",
        noTicketsTitle: "Sin Chats Iniciados",
        noTicketsMessage:
          "Actualmente no estas atendiendo a ningun cliente.",
        buttons: {
          accept: "Aceptar",
          closed: "Finalizar",
          reopen: "Reabrir"
        },
      },
      newTicketModal: {
        title: "Crear ticket",
        fieldLabel: "Escribe para buscar contacto",
        add: "Añadir",
        buttons: {
          ok: "Guardar",
          cancel: "Cancelar",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Conexiones",
          tickets: "Chats",
          quickMessages: "Respuestas rápidas",
          contacts: "Contactos",
          queues: "Dependencias & Chatbot",
          tags: "Tags",
          administration: "Administración",
          users: "Usuarios",
          settings: "Configuraciones",
          helps: "Ayuda - Tutoriales",
          messagesAPI: "API Mensajes",
          schedules: "Recordatorios",
          campaigns: "Campañas",
          annoucements: "Avisos Informativos",
          chats: "Chat Agentes Interno",
          financeiro: "Mi Plan",
          files: "Lista de archivos",
          prompts: "Open.Ai",
          queueIntegration: "Integraciones - Terceros",
        },
        appBar: {
          notRegister:"Sin notificaciones",
          user: {
            profile: "Perfil",
            logout: "Salir",
          },
        },
      },
      queueIntegration: {
        title: "Integraciones",
        table: {
          id: "ID",
          type: "Tipo",
          name: "Nombre",
          projectName: "Nombre del proyecto",
          language: "Idioma",
          lastUpdate: "Última actualización",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar proyecto",
        },
        searchPlaceholder: "Buscar...",
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage:
            "¿Está seguro? Esta acción no se puede revertir y se eliminarán de las dependencias y conexiones vinculadas.",
        },
      },
      files: {
        title: "Lista de archivos",
        table: {
          name: "Nombre",
          contacts: "Contactos",
          actions: "acción",
        },
        toasts: {
          deleted: "Lista eliminada exitosamente!",
          deletedAll: "¡Todas las listas han sido eliminadas exitosamente!",
        },
        buttons: {
          add: "Añadir",
          deleteAll: "Eliminar Todos",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteAllTitle: "Eliminar Todos",
          deleteMessage: "¿Estás seguro de que deseas eliminar esta lista?",
          deleteAllMessage: "¿Estás seguro de que deseas eliminar todas las listas?",
        },
      },
      messagesAPI: {
        title: "API",
        textMessage: {
          number: "Número",
          body: "Mensaje",
          token: "Token registrado",
        },
        mediaMessage: {
          number: "Número",
          body: "Nombre del archivo",
          media: "archivo",
          token: "Token registrado",
        },
      },
      notifications: {
        noTickets: "Sin notificación.",
      },
      quickMessages: {
        title: "Respuestas rápidas",
        searchPlaceholder: "Buscar...",
        noAttachment: "Sin adjunto",
        confirmationModal: {
          deleteTitle: "Exclusión",
          deleteMessage: "¡Esta acción es irreversible! ¿Quieres continuar??",
        },
        buttons: {
          add: "Agregar",
          attach: "Añadir archivo",
          cancel: "Cancelar",
          edit: "Editar",
        },
        toasts: {
          success: "Respuesta rapida añadida con éxito!",
          deleted: "Respuesta rapida eliminada con éxito!",
        },
        dialog: {
          title: "Crear Respuesta rapida",
          shortcode: "Palabra clave recomendamos iniciar /",
          message: "Mensaje",
          save: "Guardar",
          cancel: "Cancelar",
          geral: "Permitir editar",
          add: "Añadir",
          edit: "Editar",
          visao: "Permitir Visualizacion",
		  geral: '¿Para todos?',
        },
        table: {
          shortcode: "Palabra clave recomendamos iniciar /",
          message: "Mensaje",
          actions: "Accion",
          mediaName: "Nombre del archivo",
          status: 'Todos',
        },
      },
      messageVariablesPicker: {
        label: "Variables disponibles",
        vars: {
          contactFirstName: "Primer Nombre",
          contactName: "Nombre Completo",
          greeting: "Saludo",
          protocolNumber: "Numero de Protocolo",
          date: "Fecha",
          hour: "Hora",
        },
      },
      contactLists: {
        title: "Listas de contactos",
        table: {
          name: "Nombre",
          contacts: "Contactos",
          actions: "Acciones",
        },
        buttons: {
          add: "Nueva lista",
        },
        dialog: {
          name: "Nombre",
          company: "Empresa",
          okEdit: "Editar",
          okAdd: "Añadir",
          add: "Añadirr",
          edit: "Editar",
          cancel: "Cancelar",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "Esta acción no se puede revertir..",
        },
        toasts: {
          deleted: "Registro Eliminado",
        },
      },
      contactListItems: {
        title: "Contactos",
        searchPlaceholder: "Buscar",
        buttons: {
          add: "Nuevo",
          lists: "Lista de contactos",
          import: "Importar",
        },
        dialog: {
          name: "Nombre",
          number: "Número",
          whatsapp: "Whatsapp",
          email: "E-mail",
          okEdit: "Editar",
          okAdd: "Añadir",
          add: "Añadir",
          edit: "Editar",
          cancel: "Cancelar",
        },
        table: {
          name: "Nombre",
          number: "Número",
          whatsapp: "Whatsapp",
          email: "E-mail",
          actions: "Acciones",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "Esta acción no se puede revertir..",
          importMessage: "¿Quieres importar contactos desde esta hoja de cálculo? ",
          importTitlte: "Importar",
        },
        toasts: {
          deleted: "Registro eliminado",
        },
      },
      campaigns: {
        title: "Campañas",
        searchPlaceholder: "Buscar",
        buttons: {
          add: "Nueva Campaña",
          contactLists: "Lista de Contactos",
        },
        table: {
          name: "Nombre",
          whatsapp: "conexión",
          contactList: "Lista de Contactos",
          status: "Status",
          scheduledAt: "Recordatorio",
          completedAt: "Concluída",
          confirmation: "Confirmación",
          actions: "Acciones",
        },
        dialog: {
          new: "Nueva campaña",
          update: "Editar Campaña",
          readonly: "Sólo ver",
          form: {
            name: "Nombre",
            message1: "Mensagem 1",
            message2: "Mensagem 2",
            message3: "Mensagem 3",
            message4: "Mensagem 4",
            message5: "Mensagem 5",
            confirmationMessage1: "Mensagem de Confirmação 1",
            confirmationMessage2: "Mensagem de Confirmação 2",
            confirmationMessage3: "Mensagem de Confirmação 3",
            confirmationMessage4: "Mensagem de Confirmação 4",
            confirmationMessage5: "Mensagem de Confirmação 5",
            messagePlaceholder: "Contenido del mensaje",
            whatsapp: "Conexión",
            status: "Status",
            scheduledAt: "Programación",
            confirmation: "confirmación",
            contactList: "Lista de contactos",
            tagList: "Lista de Tags",
            fileList: "Lista de Archivos"
          },
          buttons: {
            add: "Añadir",
            edit: "Actualizar",
            okadd: "Ok",
            cancel: "Cancelar Disparos",
            restart: "Reiniciar Disparos",
            close: "cerrar",
            attach: "Anexar Archivo",
          },
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "Esta acción no se puede revertir..",
        },
        toasts: {
          success: "Operación completada con éxito",
          cancel: "Campaña Cancelada",
          restart: "Campaña Reiniciada",
          deleted: "Registro eliminado",
        },
      },
      announcements: {
        active: 'Activo',
        inactive: 'Inactivo',
        title: "Aviso Informativos",
        searchPlaceholder: "Buscar",
        buttons: {
          add: "Nuevo Aviso Informativo",
          contactLists: "Lista de Avisos Informativos",
        },
        table: {
          priority: "Prioridad",
          title: "Título",
          text: "Texto",
          mediaName: "archivo",
          status: "Status",
          actions: "Acciones",
        },
        dialog: {
          edit: "Edicion de Aviso Informativo",
          add: "Nuevo Aviso Informativo",
          update: "Editar Aviso Informativo",
          readonly: "Sólo ver",
          form: {
            priority: "Prioridade",
            title: "Título",
            text: "Texto",
            mediaPath: "archivo",
            status: "Status",
          },
          buttons: {
            add: "Añadir",
            edit: "Atualizar",
            okadd: "Ok",
            cancel: "Cancelar",
            close: "cerrar",
            attach: "Añadir archivo",
          },
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "Esta acción no se puede revertir..",
        },
        toasts: {
          success: "Operação realizada com sucesso",
          deleted: "Registro excluído",
        },
      },
      campaignsConfig: {
        title: "Configurações de Campanhas",
      },
      queues: {
        title: "Dependencias & Chatbot",
        table: {
		  id:"ID",
          name: "Nome",
          color: "Cor",
          greeting: "Mensagem de saudação",
          actions: "Ações",
          orderQueue: "Ordenação da fila (bot)",
        },
        buttons: {
          add: "Añadir Dependencia",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Você tem certeza? Essa ação não pode ser revertida! Os atendimentos dessa fila continuarão existindo, mas não terão mais nenhuma fila atribuída.",
        },
      },
      queueSelect: {
        inputLabel: "Filas",
      },
      users: {
        title: "Usuários",
        table: {
		  id: "ID",
          name: "Nome",
          email: "Email",
          profile: "Perfil",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar usuário",
        },
        toasts: {
          deleted: "Usuário excluído com sucesso.",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Todos os dados do usuário serão perdidos. Os atendimento abertos deste usuário serão movidos para a fila.",
        },
      },
      helps: {
        title: "Central de Ajuda",
      },
      schedules: {
        title: "Agendamentos",
        confirmationModal: {
          deleteTitle: "Você tem certeza que quer excluir este Agendamento?",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        table: {
          contact: "Contato",
          body: "Mensagem",
          sendAt: "Data de Agendamento",
          sentAt: "Data de Envio",
          status: "Status",
          actions: "Ações",
        },
        buttons: {
          add: "Novo Agendamento",
        },
        toasts: {
          deleted: "Agendamento excluído com sucesso.",
        },
      },
      tags: {
        title: "Tags",
        confirmationModal: {
          deleteTitle: "Você tem certeza que quer excluir esta Tag?",
          deleteMessage: "Esta ação não pode ser revertida.",
		  deleteAllMessage: "Tem certeza que deseja deletar todas as Tags?",
		  deleteAllTitle: "Deletar Todos",
        },
        table: {
          name: "Nome",
          color: "Cor",
          tickets: "Registros Tagdos",
          actions: "Ações",
        },
        buttons: {
          add: "Nova Tag",
		  deleteAll: "Deletar Todas",
        },
        toasts: {
		  deletedAll: "Todas Tags excluídas com sucesso!",
          deleted: "Tag excluído com sucesso.",
        },
      },
      settings: {
        success: "Configurações salvas com sucesso.",
        title: "Configurações",
        settings: {
          userCreation: {
            name: "Criação de usuário",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Atribuído à:",
          buttons: {
            return: "Retornar",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceitar",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Digite uma mensagem",
        placeholderClosed:
          "Reabra ou aceite esse ticket para enviar uma mensagem.",
        signMessage: "Assinar",
      },
      contactDrawer: {
        header: "Dados do contato",
        buttons: {
          edit: "Editar contato",
        },
        extraInfo: "Outras informações",
      },
      fileModal: {
        title: {
          add: "Adicionar lista de arquivos",
          edit: "Editar lista de arquivos",
        },
        buttons: {
          okAdd: "Salvar",
          okEdit: "Editar",
          cancel: "Cancelar",
          fileOptions: "Adicionar arquivo",
        },
        form: {
          name: "Nome da lista de arquivos",
          message: "Detalhes da lista",
          fileOptions: "Lista de arquivos",
          extraName: "Mensagem para enviar com arquivo",
          extraValue: "Valor da opção",
        },
        success: "Lista de arquivos salva com sucesso!",
      },
      ticketOptionsMenu: {
        schedule: "Agendamento",
        delete: "Deletar",
        transfer: "Transferir",
        registerAppointment: "Observações do Contato",
        appointmentsModal: {
          title: "Observações do Contato",
          textarea: "Observação",
          placeholder: "Insira aqui a informação que deseja registrar",
        },
        confirmationModal: {
          title: "Deletar o ticket",
		  titleFrom: "do contato ",
          message:
            "Atenção! Todas as mensagens relacionadas ao ticket serão perdidas.",
        },
        buttons: {
          delete: "Excluir",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageOptionsMenu: {
        delete: "Deletar",
        reply: "Responder",
		edit: 'Editar Mensagem',
        confirmationModal: {
          title: "Apagar mensagem?",
          message: "Esta ação não pode ser revertida.",
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrão.",
        ERR_NO_DEF_WAPP_FOUND:
          "Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.",
        ERR_WAPP_CHECK_CONTACT:
          "Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões",
        ERR_WAPP_INVALID_CONTACT: "Este não é um número de Whatsapp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.",
        ERR_INVALID_CREDENTIALS:
          "Erro de autenticação. Por favor, tente novamente.",
        ERR_SENDING_WAPP_MSG:
          "Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
        ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Já existe um tíquete aberto para este contato.",
        ERR_SESSION_EXPIRED: "Sessão expirada. Por favor entre.",
        ERR_USER_CREATION_DISABLED:
          "A criação do usuário foi desabilitada pelo administrador.",
        ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
        ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
        ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
        ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
        ERR_NO_TICKET_FOUND: "Nenhum tíquete encontrado com este ID.",
        ERR_NO_USER_FOUND: "Nenhum usuário encontrado com este ID.",
        ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
        ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
        ERR_CREATING_TICKET: "Erro ao criar tíquete no banco de dados.",
        ERR_FETCH_WAPP_MSG:
          "Erro ao buscar a mensagem no WhtasApp, talvez ela seja muito antiga.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Esta cor já está em uso, escolha outra.",
        ERR_WAPP_GREETING_REQUIRED:
          "A mensagem de saudação é obrigatório quando há mais de uma fila.",
      },
    },
  },
};

export { messages };
