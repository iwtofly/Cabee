$(document).read(() =>
{
    class Painter
    {
        tree(root)
        {
            console.log('draw tree');
        }

        msg(host, type, text)
        {
            console.log('draw msg');
        }

        link(host1, host2, type, text)
        {
            console.log('draw link');
        }
    };

    window.painter = new Painter();
});