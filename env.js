const domainServer = 'service-mchat.herokuapp.com';
const domainLocal = 'localhost';
const passwordSystem = 'truongthanhhung@266'
const ssl = 'https://';
const nonssl = 'http://';
const portLocal = 3000;
const portServer =  process.env.PORT;
module.exports = {
	passwordSystem: passwordSystem,
	env: {
		isLocal : ((portServer || 3000) == 3000 ? true : false) ,
		host: portServer ? domainServer : domainLocal,
		port: portServer || portLocal,
		originalUrl: portServer ? ssl : nonssl,
		inLocal : {
			link : nonssl+domainLocal+":"+portLocal
		},
		inServer : {
			link : ssl+domainServer
		}

	},
	database: {
		'DB_CONNECTION': 'mongodb',
		'DB_HOST': '127.0.0.1',
		'DB_PORT': '27017',
		'DB_DATABASE': 'service-mchat',
		'DB_USERNAME': 'framework_User',
		'DB_PASSWORD': 'framework_pass'
	},
	app: {
		/*
		|--------------------------------------------------------------------------
		| Application Name
		|--------------------------------------------------------------------------
		*/
		'name': 'MFace',
		/*
		|--------------------------------------------------------------------------
		| Application Title
		|--------------------------------------------------------------------------
		*/
		'title': 'Gửi Chat Facebook Hàng Loạt',
		/*
		|--------------------------------------------------------------------------
		| Application description
		|--------------------------------------------------------------------------
		*/
		'description': 'Dịch vụ Gửi Tin Nhắn Facebook Số Lượng Lớn',
		/*
		/*
		|--------------------------------------------------------------------------
		| Application google store
		|--------------------------------------------------------------------------
		*/
		'linkGoogleApp': '#appgoogle',
		/*
		|--------------------------------------------------------------------------
		| Application apple store
		|--------------------------------------------------------------------------
		*/
		'linkAppleApp': '#appapple',
		/*
		|--------------------------------------------------------------------------
		| Application Environment
		|--------------------------------------------------------------------------
		*/
		'env': 'nodejs',
		/*
		|--------------------------------------------------------------------------
		| Application Timezone
		|--------------------------------------------------------------------------
		*/
		'timezone': 'Asia/Ho_Chi_Minh',
		/*
		|--------------------------------------------------------------------------
		| Application Locale Configuration
		|--------------------------------------------------------------------------
		*/
		'locale': 'vi',
	},
	default: {
		user_online: {
			'http://localhost:3000': [
				{
					id: 'LPMtPJ_Lq5ucVvLWAAAAtest',
					link: '#',
					srcImages: 'https://picsum.photos/128/128/?random',
					altImages: '',
					inforName: 'Trương Thanh Hùng',
				}
			],
		},
		default_message: {
			'http://localhost:3000': [
				{
					'user': {
						id: 'LPMtPJ_Lq5ucVvLWAAAAtest',
						link: '#',
						srcImages: 'https://picsum.photos/128/128/?random',
						altImages: '',
						inforName: 'Trương Thanh Hùng',
					},
					'message': 'defulat'
				},
				{
					'user': {
						id: 'LPMtPJ_Lq5ucVvLWAAAAtest',
						link: '#',
						srcImages: 'https://picsum.photos/128/128/?random',
						altImages: '',
						inforName: 'Trương Thanh Hùng',
					},
					'message': 'defulat Trương Thanh Hùng Trương Thanh Hùng Trương Thanh Hùng'
				}
			]
		}
	}
}