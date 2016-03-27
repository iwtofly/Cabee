module.exports.proxy_list =
{
    '192.168.0.1' :
    {
        'delay' :
        {
            '10.1.1.1' : 100,
            '10.1.1.2' : 500
        },
        'cache' :
        {
            '10.1.1.1' :
            [
                '/upload/1.jpg'
            ],
            '10.1.1.2' :
            [
                '/upload/3.jpg'
            ]
        }
    },
    '192.168.0.2' :
    {
        'delay' :
        {
            '10.1.1.1' : 500,
            '10.1.1.2' : 100
        },
        'cache' :
        {
            '10.1.1.1' :
            [
                '/upload/1.jpg',
                '/upload/2.jpg'
            ],
            '10.1.1.2' :
            [
                '/upload/3.jpg',
                '/upload/4.jpg'
            ]
        }
    }
};

module.exports.server_list =
{
    '10.1.1.1' :
    [
        '/upload/1.jpg',
        '/upload/2.jpg'
    ],
    '10.1.1.2' :
    [
        '/upload/3.jpg',
        '/upload/4.jpg'
    ]
};