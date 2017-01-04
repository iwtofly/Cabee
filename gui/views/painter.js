/***************************************************
 * @auhor wangfang_1993@126.com                  *
 * Painter对象包含三个方法                         *
 * tree()用于接收JSON格式数据，画出相应的网络拓扑；   *
 * msg()：当某个节点的内容发生改变时动画冒泡提示       *
 * line() 画线,type还未确定                        *
 * unline() 删除某条线                             *
 * 全部按照pos以及instance来判断                    *
 **************************************************/
class Painter
{
    log(text) { 
        console.log(text);
        if (text.substr(2,1) === '1') {
            window.logs.group1.push(text);
        } else {
            window.logs.group2.push(text);
        }

        for (let log of window.logs.group1) {
            $('#logs1').append('<p>' + log + '</p>');
            $('#logs1Copy').append('<p>' + log + '</p>');
        }
        for (let log of window.logs.group2) {
            $('#logs2').append('<p>' + log + '</p>');
            $('#logs2Copy').append('<p>' + log + '</p>')
        }
        
    }

    tree() {
        let data = window.hosts;
        console.log(data)
        console.log('drawing the tree');

        let tooltip = d3.select("body")
                        .append("div")
                        .attr("class","tooltip")
                        .style("opacity",0.0)
                        .style("background-color","agba( 100, 149 ,237,0.5)");

        let width, height, positionX,
            group1 = [],
            group2 = [];
        if ($(document).width() > 1600) {
            width = 820;
            height = 600;
            positionX = {
                Tracker: 740,
                Server: 740,
                NetworkInfo: 500,
                DGW: 560,
                MEC: 330,
                station: 230
            };
        } else {
            width = 550;
            height = 600;
            positionX = {
                Tracker: 460,
                Server: 460,
                NetworkInfo: 300,
                DGW: 300,
                MEC: 200,
                station: 130
            };
        }

        let svg1=d3.select("body")     //选择文档中的body元素
                    .select("#contact-section")
                    .select(".container-fluid")
                    .select('.left')
                    .select("svg")
                    .attr({"width":width,
                            "height":height,
                    });

        let svg2=d3.select("body")     //选择文档中的body元素
                    .select("#contact-section")
                    .select(".container-fluid")
                    .select('.right')
                    .select("svg")
                    .attr({"width":width,
                            "height":height,
                    });

        for (let i = 0; i < data.length; i++) {
            if (data[i].conf.group === 1 ) {
                group1.push(data[i]);
            } else {
                group2.push(data[i]);
            }
        }

        topol(group1, 1);
        topol(group2, 2);

        function topol(nodesTemp, region) {
            let svg = region === 1 ? svg1 : svg2;
            console.log('group ' + region + 'init');

            let peer = [], // peer用来记录每个DGW下有几个MEC
                DGWnum = 0,
                MECnum = 0,
                target = {};

            for (let item of nodesTemp) {
                if (item instanceof Proxy) {
                    if (item.conf.pos) {
                        if (item.conf.pos.length === 1) {
                            DGWnum++;
                        } else {
                            MECnum++;
                            if (peer[item.conf.pos.substr(0, 1)] == undefined) {
                                peer[item.conf.pos.substr(0, 1)] = 1;
                            } else {
                                peer[item.conf.pos.substr(0, 1)] = peer[item.conf.pos.substr(0, 1)] + 1;
                            }
                            // console.log("这里有peer更新"+ peer[item.conf.pos.substr(0,1)] ) 
                        }
                    }    
                }          
            }
            // console.log(peer);

            let netInfExist = false,
                info;
            let nodes = d3.range(0, nodesTemp.length).map((i) => {
                if (nodesTemp[i] instanceof Track) {
                    target['T' + nodesTemp[i].conf.group] = i;
                    return {
                        name: "Tracker",
                        img: "./img/server1.png",
                        data: "Tracker",
                        x: positionX.Tracker,
                        y: 80,
                        group: nodesTemp[i].conf.group
                    }
                } else if (nodesTemp[i] instanceof Server) {
                    target['S' + nodesTemp[i].conf.group] = i;
                    return {
                        name: "Server",
                        img: "./img/server1.png",
                        data: nodesTemp[i].videos,
                        x: positionX.Server,
                        y: 266,
                        group: nodesTemp[i].conf.group
                    }
                }  else if (nodesTemp[i] instanceof NetworkInfo) {
                    netInfExist = true;
                    info = nodesTemp[i];
                    target['Info' + nodesTemp[i].conf.group] = i;
                    return {
                        name: "NetworkInfo",
                        img: "./img/server1.png",
                        data: '',
                        x: positionX.NetworkInfo,
                        y: 20,
                        group: nodesTemp[i].conf.group
                    }
                } else if(nodesTemp[i] instanceof Proxy) {
                    let posIndex = nodesTemp[i].conf.pos;
                    target[posIndex] = i;
                    switch (nodesTemp[i].conf.pos.length) {
                        case 1:
                            return {
                                name: "DGW_"+posIndex,
                                img: "./img/DGW.png",
                                pos: posIndex,
                                data: nodesTemp[i].caches,
                                x: positionX.DGW,
                                y: posIndex * height / (DGWnum + 1),
                                group: nodesTemp[i].conf.group
                            }
                            break;
                        case 2:
                            let selfPos = nodesTemp[i].conf.pos.substr(1,2);
                            let fatherPos = nodesTemp[i].conf.pos.substr(0,1);
                            let posY = fatherPos == "1" 
                                        ? ( parseInt(fatherPos - 1) * parseInt(peer[fatherPos]) + parseInt(selfPos))
                                            * height / (MECnum + 1)
                                        : ( parseInt(fatherPos - 1) * parseInt(peer[fatherPos - 1]) + parseInt(selfPos))
                                            * height/(MECnum + 1);

                            return {
                                name: "MEC_" + fatherPos + "_sub" + selfPos, 
                                img: "./img/DGW.png",
                                data: nodesTemp[i].caches,
                                pos: nodesTemp[i].conf.pos,
                                x: positionX.MEC,
                                y: posY,
                                group: nodesTemp[i].conf.group
                            }
                        default:
                           console.log(nodesTemp[i].conf.pos.length);
                    }
                } else if (nodesTemp[i] instanceof Station) {
                    let selfPos = nodesTemp[i].conf.pos.substr(1,2);
                    let fatherPos = nodesTemp[i].conf.pos.substr(0,1);
                    let posY = fatherPos == "1" 
                                ? ( parseInt(fatherPos - 1) * parseInt(peer[fatherPos]) + parseInt(selfPos))
                                    * height / (MECnum + 1)
                                : ( parseInt(fatherPos - 1) * parseInt(peer[fatherPos - 1]) + parseInt(selfPos))
                                    * height/(MECnum + 1);

                    return {
                                name: 'Station', 
                                img: "./img/station1.png",
                                data: 'Station',
                                pos: nodesTemp[i].conf.pos,
                                x: positionX.station,
                                y: posY,
                                group: nodesTemp[i].conf.group
                            }
                }
            });
            // console.log(nodes);

            let edges = d3.range(1, nodesTemp.length).map((i) => {
                if (nodes[i].name.substr(0, 6) === 'Server') {
                    return {source: i, target: target['T' + nodes[i].group]};
                } else if (nodes[i].name === "NetworkInfo") {
                    return {source: i, target: target['T' + nodes[i].group] };
                } else if (nodes[i].name === "Station") {
                    // console.log('station ' + i + ' target : ' + target[nodes[i].pos])
                    return {source: i, target: target[nodes[i].pos] };
                } else if (nodes[i].name.substr(0,3) === "DGW") {
                    return {source: i, target: target['S' + nodes[i].group] };
                } else if (nodes[i].name.substr(0,3) === "MEC") {
                    let selfPos = nodes[i].pos.substr(1,2);
                    let fatherPos = nodes[i].pos.substr(0,1);
                    return { source: i, target: target[fatherPos] };
                }
            });
            if (netInfExist) {
                edges.push({source: target['Info' + info.conf.group], target: target['S' + info.conf.group]})
            }
            // console.log(edges);

            let force = d3.layout.force()
                                .nodes(nodes) //指定节点数组
                                .links(edges)  //连线数组
                                .size([width,height])  //作用域范围
                                .linkDistance(150)
                                .gravity(.05)
                                .charge([-400]);

            let drag = force.drag().on("dragstart", dragstart);
            force.start();

            // var svgGroup1=d3.select("#group1");
            let svg_edges = svg.selectAll("line")
                               .data(edges)
                               .enter()
                               .append("line")
                               .style("stroke","#ccc")
                               .style("stroke-width",2)
                               .attr('lid',function(d,i){
                                return i+1;
                               });

            let svg_nodes_img = svg.selectAll("image")
                               .data(nodes)
                               .enter()
                               .append('image')
                               .attr("width",function(d){
                                  if(d.name == "Server" || d.name == "Tracker" || d.name == "NetworkInfo"){
                                    return 80;
                                  } else {
                                    return 50
                                  }
                               })
                               .attr("height",function(d){
                                  if(d.name == "Server" || d.name == "Tracker" || d.name == "NetworkInfo"){
                                    return 70;
                                  } else {
                                    return 50
                                  }
                               })
                               .attr("xlink:href",function(d){
                                    return d.img;
                               })
                               .call(force.drag) //节点能够拖动
                               .attr('did',function(d,i){
                                return d.name;
                               })
                               .on("mouseover",function(d,i){
                                    tooltip.html(d.data==undefined ? "空" : JSON.stringify(d.data).split(",").join('<br/>'))
                                            .style("left", (d3.event.pageX) + "px")
                                            .style("top", (d3.event.pageY + 20) + "px")
                                            .style("opacity",1.0)
                                            .style("background-color","rgba(  238, 232, 205,0.8)");
                                })
                                .on("mousemove",function(d){
                                /* 鼠标移动时，更改样式 left 和 top 来改变提示框的位置 */

                                    tooltip.style("left", (d3.event.pageX) + "px")
                                           .style("top", (d3.event.pageY + 20) + "px");
                                })
                                .on("mouseout",function(d){
                                /* 鼠标移出时，将透明度设定为0.0（完全透明）*/

                                   tooltip.style("opacity",0.0);
                                });

            svg_nodes_img.on("dblclick",dblclick);
            let svg_texts = svg.selectAll("text")
                            .data(nodes)
                            .enter()
                            .append("text")
                            .style("fill", "white")
                            .attr("dx", 10)
                            .attr("dy", 15)
                            .text((d) => {
                                 return d.name;
                            });

           
            force.on("tick",function(){ //每个时间间隔
                //更新连线坐标
                svg_edges.attr("x1", (d) => {d.fixed = true; return d.source.x;})
                            .attr("y1", (d) => {d.fixed = true; return d.source.y;})
                            .attr("x2", (d) => {d.fixed = true; return d.target.x;})
                            .attr("y2", (d) => {d.fixed = true; return d.target.y;})
                //更新节点坐标
                svg_nodes_img.attr("x", (d) => {d.fixed = true; return d.x - 25})
                            .attr("y", (d) => {d.fixed = true; return d.y - 30});

                svg_texts.attr("x", (d) => { d.fixed = true; return d.x + 10})
                            .attr("y", (d) => { d.fixed = true; return d.y + 10});

            });
            function dblclick(d) {
                d3.select(this).classed("fixed", d.fixed = false);
            }

            function dragstart(d) {
                d3.select(this).classed("fixed", d.fixed = true);
            }

        }  

        /****************以上两方案可以复用****************/
        /****** 以下为测试 *******/
        // 测试line unline
        /*
        setTimeout(() => {
            this.line(group1[2], group1[1], 'offer', 'offer');
            setTimeout (() => {
                this.unline(group1[2], group1[1], 'offer', 'offer');
            },2000)
        },2000)*/

        // 测试broadcast
        /*
        setTimeout(() => {
            let tempArr = [];
            tempArr.push(data[5],data[2], data[3], data[4]);
            this.broadcast(data[0], tempArr);
        })*/
        
        // 测试进度条
        /**/
        // let timer1 = 0;
        // setTimeout(() => {
        //     this.myInterval = setInterval( () => {
        //         this.showProgress(timer1, 1);
        //         timer1++;
        //         if (timer1 == 101) {
        //             clearInterval(this.myInterval);
        //         }
        //     },20)

        // }, 200) 

        // let timer2 = 0;
        // setTimeout(() => {
        //     this.myInterval2 = setInterval( () => {
        //         this.showProgress(timer2, 2);
        //         timer2++;
        //         if (timer2 == 101) {
        //             clearInterval(this.myInterval2);
        //         }
        //     },20)

        // }, 3000) 
        this.refresh();
    }

    // src & dst are object-reference to a User/Server/Proxy
    line(src, dst, type, text) {
        // console.log(dst);
        let region = src.conf.group;
        let linkTooltip = d3.select("body")
                         .append("div")
                         .attr("class","linkTooltip")
                         .style("opacity",0.0);
        let lineColor,dx,dy;
        switch (type) {
            case "ping":
              lineColor = "yellow"; dx = 0; dy = 0; break;
            case "pong":
              lineColor = "pink"; dx = 0; dy = 0; break;
            case "fetch":
              lineColor = "red"; dx = 0; dy = 0; break;
            case "offer":
              lineColor = "blue"; dx = 0; dy = 0; break;
            default:
              lineColor = "green"; dx = 0; dy = 0;
        }
        let group = src.conf.group ? src.conf.group : dst.conf.group;
        let node1 = this.findDOMNode(src, undefined, group);
        let node2 = this.findDOMNode(dst, undefined, group);

        let x1 = parseInt(node1.attr("x"), 10) + 25,
            y1 = parseInt(node1.attr("y"), 10) + 25,
            x2 = parseInt(node2.attr("x"), 10) + 25,
            y2 = parseInt(node2.attr("y"), 10) + 25;


        if (x1 - x2 > 30) { x1 -= 20 + dx; x2 += 23 + dx; }
        if (y2 - y1 > 60) { y2 -= 20 + dy; y1 += 18 + dy; }
        if (y1 - y2 > 60) { y1 -= 20 + dy; y2 += 18 + dy; }
        if (x2 - x1 > 30) { x2 -= 20 + dx; x1 += 23 + dx; }
        let lineData = [
               {x: x1, y: y1},
               {x: x2, y: y2}
            ];
        let svg = d3.select('#group' + region);
        let defs = svg.append("defs");
        let offsetX = text == 'offer' ? -50 : 10;
        let offsetY = text == 'offer' ? 0 : 20;
        let textTip = svg.append("text")
                        .attr({
                            "x": (x1 + x2) / 2 + offsetX,
                            "y": (y1 + y2) / 2 + offsetY,
                            "stroke": 'pink'
                        })
                        .text(text)
                        .transition()
                        .duration(1000)
                        .delay(1500)
                        .remove();

        let arrowMarker = defs.append("marker")
                            .attr("id", "arrow")
                            .attr("markerUnits", "strokeWidth")
                            .attr("markerWidth", "12")
                            .attr("markerHeight", "12")
                            .attr("viewBox", "0 0 12 12")
                            .attr("refX", "6")
                            .attr("refY", "6")
                            .attr("orient", "auto");

        let arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        arrowMarker.append("path")
                    .attr("d", arrow_path)
                    .attr("fill", "#000");

        let lidTemp = src.conf.name + dst.conf.name;
        // console.log('line -- lidTemp : ' + dst.conf.name);
        let line = svg.append("line")
                        .attr('lid', () => {
                            return lidTemp;
                        })
                        .attr("x1", x1)
                        .attr("y1", y1)
                        .attr("x2", x1)
                        .attr("y2", y1)
                        .attr("stroke", lineColor)
                        .attr("stroke-width", 2)
                        .attr("marker-end", "url(#arrow)")
                        .transition()
                        .duration(1500)
                        .attr("x2", x2)
                        .attr("y2", y2);
    }

    unline(src, dst ,type,text) {
        let group = src.conf.group ? src.conf.group : dst.conf.group;
        let node1 = this.findDOMNode(src, 'delete', group);
        let node2 = this.findDOMNode(dst, undefined, group);
        let lidTemp = src.conf.name + dst.conf.name;
        // console.log('unline -- lidTemp : ' + dst.conf.name);

        // remove the line
        let lineMove = $("svg[id=group" + src.conf.group + "] line[lid='"+lidTemp+"']").remove();
        let lineColor,dx,dy;
        switch (type) {
            case "ping":
              lineColor = "yellow"; dx = 0; dy = 0; break;
            case "pong":
              lineColor = "pink"; dx = 0; dy = 0; break;
            case "fetch":
              lineColor = "red"; dx = 0; dy = 0; break;
            case "offer":
              lineColor = "blue"; dx = 0; dy = 0; break;
            default:
              lineColor = "green"; dx = 0; dy = 0;
        }
        let x1, y1, x2, y2, backTime;
        if (type == 'push') {
            x1 = parseInt(node2.attr("x")) + 25,
            y1 = parseInt(node2.attr("y")) + 25,
            x2 = parseInt(node1.attr("x")) + 25,
            y2 = parseInt(node1.attr("y")) + 25;
            backTime = 1000;
        } else {
            x1 = parseInt(node1.attr("x")) + 25,
            y1 = parseInt(node1.attr("y")) + 25,
            x2 = parseInt(node2.attr("x")) + 25,
            y2 = parseInt(node2.attr("y")) + 25;
            backTime = 1000;
        }

        if (x1 - x2 > 30) { x1 -= 20 + dx; x2 += 23 + dx; }
        if (y2 - y1 > 60) { y2 -= 20 + dy; y1 += 18 + dy; }
        if (y1 - y2 > 60) { y1 -= 20 + dy; y2 += 18 + dy; }
        if (x2 - x1 > 30) { x2 -= 20 + dx; x1 += 23 + dx; }
        let lineData = [
               {x: x1, y: y1},
               {x: x2, y: y2}
            ];

        let svg = d3.select('#group' + src.conf.group);
        let defs = svg.append("defs");

        let offsetX = text == 'offer' ? -50 : 10;
        let offsetY = text == 'offer' ? 0 : 20;

        let textTip = svg.append("text")
                        .attr({
                            "x": (x1 + x2) / 2 + offsetX,
                            "y": (y1 + y2) / 2 + offsetY,
                            "stroke": "pink"
                        })
                        .text(text)
                        .transition()
                        .duration(1000)
                        .delay(1500)
                        .remove();
        let arrowMarker = defs.append("marker")
                            .attr("id", "arrow")
                            .attr("markerUnits", "strokeWidth")
                            .attr("markerWidth", "12")
                            .attr("markerHeight", "12")
                            .attr("viewBox", "0 0 12 12")
                            .attr("refX", "6")
                            .attr("refY", "6")
                            .attr("orient", "auto");

        let arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        arrowMarker.append("path")
                    .attr("d", arrow_path)
                    .attr("fill", "#000");

        let line = svg.append("line")
                       .attr('lid',function(){
                          return lidTemp;
                        })
                       .attr("x1",x1)
                       .attr("y1",y1)
                       .attr("x2",x2)
                       .attr("y2",y2)
                       .attr("stroke",lineColor)
                       .attr("stroke-width",2)
                       .attr("marker-end","url(#arrow)")
                       .transition()
                       .duration(backTime)
                       .attr("x2",x1)
                       .attr("y2",y1)
        // remove the backline
        setTimeout(() => {
          line.remove();
        }, 20)
    }

    // src is Track or server.
    // dstArr is an Array(contains some proxies). 
    broadcast(src,dstArr) {

        // var node1=this.findDOMNode(src);
        let node1=src;

        dstArr.map((item,index) => {

            this.line(node1, item, "push", "push");

            setTimeout(() => {
                this.unline(node1, item , "push", "push");
            }, 2000)

        });
    }

    // refresh the table, need the info of server and proxies
    refresh() {

        let tbody = $('tbody');
        tbody.empty();
        tbody.css('color','white');

        let data = window.hosts;
        let group1 = [],
            group2 = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].conf.group === 1 && (data[i] instanceof Server || data[i] instanceof Proxy)) {
                group1.push(data[i]);
            } else if (data[i].conf.group === 2 && (data[i] instanceof Server || data[i] instanceof Proxy)) {
                group2.push(data[i]);
            }
        }

        refreshTable(group1, 1);
        refreshTable(group2, 2)

        function refreshTable(arg, num) {
            for (let item of arg) {
                // console.log(item);
                let tbody1 = $('#table' + num +' tbody');
                let videosTemp = {};
                if (item instanceof Server) {
                    for (let video in item.videos) {
                        videosTemp[video] = [];
                        for(let piece in item.videos[video]) {
                            videosTemp[video].push(piece);
                        }
                    }
                }
                let videos = item instanceof Server ? JSON.stringify(videosTemp) : JSON.stringify(item.caches);
                tbody1.append("<tr><td>" + item.conf.name + "</td>" 
                    + "<td>" + item.ip + "</td>"
                    + "<td>" + item.conf.port + "</td>"
                    + "<td>" + videos + "</td>"
                    + "</tr>");
            }
        }

    }

    showProgress(progress, group, video, piece)
    {
        // console.log("showProgress "+ progress);
        let region = group === 1 ? 'left' : 'right';
        
        if (group == 1) {
            this.showProgress1(progress, video, piece);
        } else {
            this.showProgress2(progress, video, piece);
        }
        /*
        var progressBar = $('#my-progress-bar-' + region);

        progressBar.empty();

        progressBar.append('<div class="progress">'
                                + '<div id="progress-bar" class="progress-bar progress-bar-warning progress-bar-striped active">'
                                + '<div class="progress-value">'
                                + progress 
                                + '%</div></div></div>'
                )
        $("#progress-bar").css("width",progress +'%');*/
    }

    showProgress1(progress, video, piece) {

        var progressBar1 = $('#my-progress-bar-' + 'left');

        progressBar1.empty();

        progressBar1.append('<div class="progress">'
                                + '<div id="progress-bar" class="progress-bar progress-bar-success progress-bar-striped active">'
                                + '<div class="progress-value">'
                                + progress 
                                + '%</div></div></div>'
                )
        $(".video-name1").html(video + '-' + piece);
        $("#progress-bar").css("width",progress +'%');
    }

    showProgress2(progress, video, piece) {
        var progressBar = $('#my-progress-bar-' + 'right');
        // console.log(progressBar);
        progressBar.empty();

        progressBar.append('<div class="progress">'
                                + '<div id="progress-bar" class="progress-bar progress-bar-info progress-bar-striped active">'
                                + '<div class="progress-value">'
                                + progress 
                                + '%</div></div></div>'
                )
        $(".video-name2").html(video + '-' + piece);
        $("#progress-bar").css("width",progress +'%');
    }

    findDOMNode(host, type, group) {
        let node, tempName;
        if (host instanceof User) {
            if (type === 'delete') {
                tempName = 'user';
                console.log('delete user');
                node = $("svg image[did='User']").fadeOut(3000);
            } else {
                let svg = d3.select('#group' + group);
                // console.log(group);
                let userNode=svg.append('image')
                          .attr("width",60)
                          .attr("height",80)
                          .attr("xlink:href","./img/phone1.png")
                          .attr("x",30)
                          .attr("y",150)
                          .attr("did","User");
                node=$("svg image[did='User']");
                // console.log("User in FE");
                setTimeout( () => {
                    $("svg image[did='User']").fadeOut(3000);
                    // console.log('User 连接超时自动删除');
                },
                10000
                )
            }
            return node;
        } else {
            if (host instanceof Track) {
                tempName = 'Tracker';
            }
            if (host instanceof NetworkInfo) {
                tempName = 'NetworkInfo';
            }
            else if (host instanceof Server) {
                tempName = 'Server';
            }
            else if (host instanceof Proxy) {
                // 缓存节点，DGW或者MEC
                switch (host.conf.pos.length) {
                    case 1: 
                        let posIndex = host.conf.pos;
                        tempName = 'DGW_' + posIndex;
                        break;
                    case 2:
                        let selfPos = host.conf.pos.substr(1,2);
                        let fatherPos = host.conf.pos.substr(0,1);
                        if (host.conf.name.substr(0,3) === "MEC") {
                            tempName = "MEC_"+fatherPos+"_sub"+selfPos ;
                        } else if (host.conf.name === 'station') {
                            tempName = 'station';
                        }
                        break;
                    default:
                        console.log('未知类型节点');
                }
            }
            if(host.conf == undefined ){
                console.log(host);
            }
            node = $("svg[id=group" + host.conf.group + "] image[did=" + tempName + "]");
            if (type === 'name') {
                return tempName;
            } else {
                return node;
            }
        }
    }

    isOwnEmpty(obj) {
        for (let name in obj) {
            if (obj.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    }

    //在指定节点跳出tooltip提示出相应的text
    msg(host, type, text)
    {
        // console.log('draw msg');
        var msgTooltip = d3.select("body")
                         .append("div")
                         .attr("class","msgTooltip")
                         .style("opacity",0.0);


        var nameIndex, node;
        // console.log(host);
        node = this.findDOMNode(host);
        nameIndex = this.findDOMNode(host,'name');
        var offsetTop = node.position().top;
        var offsetLeft = node.position().left;

        d3.select(".msgTooltip").html(nameIndex + " : " + type + "-----" + text)
                                .style("left", offsetLeft + "px")
                                .style("top", offsetTop - 60 + "px")
                                .style("opacity", 1.0);

        setTimeout(()=>{
            d3.select(".msgTooltip").html(nameIndex + " : " + type + "-----" + text)
                .style("opacity",0);
        },3000);
    }
};
