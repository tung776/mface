const socket = io.connect(baseUrl);
// jQuery Document
$(document).ready(function () {
    ///đón thông tin id socket
    socket.on('id_socket', function (data) {
        ///gán data lấy đc từ server cho biến khai báo trong vuejs page
        vuejs.socket_id_client = data;
        ///thông báo cho server rằng: user này vừa onlline
        socket.emit('user_onl_and_messages_chat', { userName: userName, assetURL: pageURL });
    });
    
    socket.on('server_user_onl_and_messages_chat', function (data) {
        ////soccket báo cho vuejs thực hiện render lại user onl
        console.log(data);
        vuejs.user_onl = data.user_online_inr;
        if(data.default_message != pageURL+'null')
            vuejs.messages_chat = data.default_message;
    });
    


    socket.on('server-send-data', function (data) {
        var data_message = {
            'user': data.user,
            'message': data.message
        }
        
        vuejs.messages_chat.push(data_message);
        //vuejs.messages_chat = vuejs.messages_chat.push(data_message);
        $('div').animate({ scrollTop: $(".wrapper-content-chat-onl").height() });
        var element = document.getElementsByClassName("wrapper--room-chat-online");
        element.scrollTop = element.scrollHeight;
        var element = document.getElementsByClassName("wrapper--user-online");
        element.scrollTop = element.scrollHeight;
    });



    ///slider
    $(".variable").slick({
        infinite: true,
        variableWidth: true
    });
});

$(window).on('load resize', function () {
    if ($(window).width() > 767) {

    } else {

    }
});









Vue.use(VueResource);
var vuejs = new Vue({
    el: "#homeVue",
    data: {
        'curentUrl': baseUrl,
        'mobile': $(document).width() < 767 ? true : false,
        'backgroundMenuFixed': window.scrollY < heightMenu,
        'toggleInput': false,
        'activeMenu': false,
        'item_data_vuesjs': item_data_vuesjs,
        'isLoading': false,
        'item_data_system_nomination_vuesjs': item_data_system_nomination_vuesjs,
        'user_onl': user_onl,
        'messages_chat': message_chat,
        'countItem': $(document).width() > 767 ? 4 : $(document).width() > 525 ? 3 : 2,
        'socket_id_client': ''
    },

    // bind event handlers to the `handleResize` method (defined below)
    ready: function () {
        window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.handleResize)
    },

    methods: {
        // whenever the document is resized, re-set the 'fullHeight' variable
        handleResize(event) {

        },
        onResize(event) {
            this.mobile = $(document).width() < 767 ? true : false;
            this.countItem = $(document).width() > 767 ? 4 : $(document).width() > 525 ? 3 : 2;
        },
        handleScroll() {
            this.backgroundMenuFixed = window.scrollY < heightMenu
        },
        toggleInputOrSearch() {
            this.toggleInput = !this.toggleInput;
        },
        doLoadMore() {
            this.isLoading = !this.isLoading;
            //////load data
            var url = baseUrl + '/ajax/data_user';
            this.$http.get(url).then(response => {

                var data_load = response.data;
                obj_data_load = JSON.parse(data_load);
                console.log(obj_data_load);
                this.item_data_vuesjs = this.item_data_vuesjs.concat(obj_data_load);
                this.isLoading = !this.isLoading;
            });
        },
        sendMessagesVue() {
            var message = $('.input_msg_write input.write_msg').val();
            $('.input_msg_write input.write_msg').val('');
            // tell server to execute 'sendchat' and send along one parameter
            socket.emit('gui_chat__route', { message: message, pageURL: pageURL });
        }
    },
    mounted() {
        // Register an event listener when the Vue component is ready
        window.addEventListener('resize', this.onResize)
    },
    beforeMount() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeDestroy() {
        // Unregister the event listener before destroying this Vue instance
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('scroll', this.handleScroll);
    }
});
