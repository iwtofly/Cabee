from mitmproxy.models import HTTPResponse
from mitmproxy.script import concurrent
from netlib.http import Headers
from urllib import quote_plus
import httplib2

@concurrent
def request(context, flow):
    if flow.request.path.endswith("jpg"):
        
        url = "http://localhost:12347/fetch/" + quote_plus(flow.request.url)
        
        h = httplib2.Http(".cache")
        
        resp_proxy, content = h.request(url, headers={'cache-control':'no-cache'})
        
        resp_ret = HTTPResponse(
            "HTTP/1.1", 200, "OK",
            Headers(Content_Type="image/jpeg"),
            content)
        flow.reply(resp_ret)
        
#def request(context, flow):
#    if flow.request.path.endswith("jpg"):
#        s = StringIO()
#        img = Image.open("./doge.jpg")
#        img.save(s, "JPEG")
#        resp = HTTPResponse(
#            "HTTP/1.1", 200, "OK",
#            Headers(Content_Type="image/jpeg"),
#            s.getvalue())
#        flow.reply(resp)
