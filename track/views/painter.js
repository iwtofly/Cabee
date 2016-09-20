class Painter
{   
    //此处，需要统一各节点命名方式
    tree(root)
    {
        console.log('draw tree');
        var tooltip = d3.select("body")  
                    .append("div")  
                    .attr("class","tooltip")  
                    .style("opacity",0.0)
                    .style("background-color","agba( 100, 149 ,237,0.5)");
        var width = 800,
            height = 700;

        var svg=d3.select("body")     //选择文档中的body元素
                    .select("#content")
                    .append("svg")     
                    .attr({"width":width,
                            "height":height,
                       });
        var myNode =[];
        myNode.push(root.servers[0]);
        for(var k1=0;k1<root.proxies.length;k1++){
            myNode.push(root.proxies[k1])
            for(var k2=0;k2<root.proxies[k1].nodes.length;k2++){
              myNode.push(root.proxies[k1].nodes[k2]);
            }
        }
        console.log(JSON.stringify(myNode));

        var targetT,targetS,targetA,targetB,subIndex,targetSub={}; 

        var nodeLength=myNode.length;
        var nodes=d3.range(0,nodeLength).map(function(i){
           if(myNode[i].name.substr(0,3)=="Sir"){
                targetS=i;
                return{name:"Server",img:"./img/cloud-server.png",data:"myNode[i]",x:570,y:246}
           }
           if(myNode[i].name.substr(0,7)=="GATEWAY"){
                if(myNode[i].pos=="1"){
                    targetA=i;
                    return{name:"DGW_A",img:"./img/swtich.png" ,data:myNode[i].data, x:380,y:248}
                }else{
                    targetB=i;
                    return {name:"DGW_B",img:"./img/swtich.png", data:"",x:380,y:450}
                }
           }
           if(myNode[i].pos.length==2){
                if(myNode[i].pos.substr(0,1)=="1"){
                    return  {name:"MEC_A_sub"+myNode[i].pos.substr(1,2),img:"./img/MEC.png",data:"",x:200 , y : myNode[i].pos.substr(1,2)==1 ? 145:295}
                }else{
                    return {name:"MEC_B_sub"+myNode[i].pos.substr(1,2),img:"./img/MEC.png",data:"",x:200 , y : myNode[i].pos.substr(1,2)==1 ? 415:580}
                }
           }
        })

        console.log(JSON.stringify(nodes));

        var edges = d3.range(1,nodeLength).map(function(i){
            console.log("nodes["+i+"]"+JSON.stringify(nodes[i]))
            if(nodes[i].name=="DGW_A"){
                 return {source: i,target: targetS}
            }if(nodes[i].name=="DGW_B"){
                 return {source: i,target: targetS}
            }else if(nodes[i].name.substr(0,9)=="MEC_A_sub"){
              var temTar1= targetA==undefined ? targetS:targetA;
              return {source:i,target:temTar1}
            }else if(nodes[i].name.substr(0,9)=="MEC_B_sub"){
              var temTar2= targetB==undefined ? targetS:targetB;
              return {source:i,target:temTar2}
            }
        })

        console.log("edges: "+JSON.stringify(edges))

        var force = d3.layout.force()
                      .nodes(nodes) //指定节点数组
                      .links(edges)  //连线数组
                      .size([width,height])  //作用域范围
                      .linkDistance(150)
                      .gravity(.05)
                      .charge([-400]);

        var drag = force.drag()
                      .on("dragstart", dragstart);
        force.start();
        console.log(nodes);
        console.log(edges);
        //   添加连线
        var svg=d3.select("svg");

        var svg_edges = svg.selectAll("line")
                           .data(edges)
                           .enter()
                           .append("line")
                           .style("stroke","#ccc")
                           .style("stroke-width",3)
                           .attr('lid',function(d,i){
                            return i+1;
                           })
        // console.log("svg_edges:"+JSON.stringify(svg_edges))
        var color = d3.scale.category20();

        var svg_nodes_img = svg.selectAll("image")
                           .data(nodes)
                           .enter()
                           .append('image')
                           .attr("width",50)
                           .attr("height",50)
                           .attr("xlink:href",function(d){
                                return d.img;
                           })
                           .call(force.drag) //节点能够拖动
                           .attr('did',function(d,i){
                            return d.name;
                           })
                           .on("mouseover",function(d,i){                                 
                                tooltip.html(JSON.stringify(d.data)+"<br />" +   
                                  d.data+" ggggggggg")  
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
                            })

        // console.log("svg_nodes_img:"+JSON.stringify(svg_nodes_img))

        svg_nodes_img.on("dblclick",dblclick)
        //描述节点的文字
        var svg_texts = svg.selectAll("text")
                            .data(nodes)
                            .enter()
                            .append("text")
                            .style("fill","black")
                            .attr("dx",20)
                            .attr("dy",8)
                            .text(function(d){
                                 return d.name;
                            });

        force.on("tick",function(){ //每个时间间隔
            
            //更新连线坐标
            svg_edges.attr("x1",function(d){d.fixed = true ;return d.source.x ;})
                      .attr("y1",function(d){d.fixed = true; return d.source.y ;})
                      .attr("x2",function(d){d.fixed = true; return d.target.x ;})
                      .attr("y2",function(d){d.fixed = true; return d.target.y})
            //更新节点坐标
            svg_nodes_img.attr("x",function(d){d.fixed = true; return d.x-15})
                      .attr("y",function(d){ d.fixed = true; return d.y-30});

            svg_texts.attr("x",function(d){ d.fixed = true; return d.x+10})
                      .attr("y",function(d){ d.fixed = true; return d.y+10});

        });

        function dblclick(d) {
            d3.select(this).classed("fixed", d.fixed = false);
        }

        function dragstart(d) {
            d3.select(this).classed("fixed", d.fixed = true);
        } 
    }

    //在指定节点跳出tooltip提示出相应的text
    msg(host, type, text)
    {
        console.log('draw msg');
        var msgTooltip = d3.select("body")  
                         .append("div")  
                         .attr("class","msgTooltip")  
                         .style("opacity",0.0); 


        var nameIndex, node;

        node=this.findDOMNode(host);
        console.log('node.attr("y")='+node.attr("y"))
        // var offsetTop=parseInt($("svg").css("margin-top"))+parseInt(node.attr("y"));
        var offsetTop = node.offset().top;
        var offsetLeft = node.offset().left;
        // var offsetLeft=parseInt($("svg").css("margin-left"))+parseInt(node.attr("x"));
        console.log(JSON.stringify(node)+"offsetTop:"+offsetTop,"offsetLeft:"+offsetLeft)
        d3.select(".msgTooltip").html(nameIndex+": "+type+"-"+text)
            .style("left",offsetLeft+ "px")  
            .style("top", offsetTop-60+"px")
            .style("opacity",1.0);

        setTimeout(()=>{
            d3.select(".msgTooltip").html(nameIndex+": "+type+"-"+text)
                .style("opacity",0);
        },3000);

    }

    link(host1, host2, type, text)
    {
        console.log('draw link');
        var linkTooltip = d3.select("body")  
                         .append("div")  
                         .attr("class","linkTooltip")  
                         .style("opacity",0.0); 

        var node1=this.findDOMNode(host1);
        var node2=this.findDOMNode(host2);

        var x1=parseInt(node1.attr("x"))+25,
            y1=parseInt(node1.attr("y"))+25,
            x2=parseInt(node2.attr("x"))+25,
            y2=parseInt(node2.attr("y"))+25;

        var lineData=[
                   {x:x1,y:y1},
                   {x:x2,y:y2},
                ];

        var svg = d3.select('svg');

        var ball=svg.append("circle")
                    .attr({
                        "cx":x1,
                        "cy":y1,
                        "r":"5",
                        "stroke":"red",
                        "fill":"red"
                    })
                    .transition()
                    .duration(1000)
                    .delay(500)
                    .ease("linear")
                    .attr({
                        "cx":x2,
                        "cy":y2, 
                    })
                    .transition()
                    .delay(1500)
                    .remove();

        var textTip=svg.append("text")
                        .attr({
                            "x":(x1+x2)/2+10,
                            "y":(y1+y2)/2+10,
                            "stroke":"blue"
                        })
                        .text(text)
                        .transition()
                        .duration(1000)
                        .delay(500)
                        .remove();



        var lineFunction = d3.svg.line()
                             .x(function(d) { return d.x; })
                             .y(function(d) { return d.y; })
                             .interpolate("basis");  //linear
        var lineGraph = svg.append("path")
                            .attr("d", lineFunction(lineData))
                            .attr("stroke", "lightblue")
                            .attr("stroke-width", 5)
                            .attr("fill", "none")
                            .transition()
                            .duration(500)
                            .ease("bounce")
                            .attr("stroke", "blue")
                            .delay(500)
                            .transition()
                            .duration(500)
                            .ease("linear")
                            .attr("stroke", "lightblue")
                            .transition()
                            .delay(1500)
                            .duration(500)
                            .ease("linear")
                            .attr("opacity", 0);
    }

    //第二种动画，连线用延伸的箭头线
    linkArrow(host1, host2, type, text){

            var linkTooltip = d3.select("body")  
                         .append("div")  
                         .attr("class","linkTooltip")  
                         .style("opacity",0.0); 

            var node1=this.findDOMNode(host1);
            var node2=this.findDOMNode(host2);

            var x1=parseInt(node1.attr("x"))+25,
                y1=parseInt(node1.attr("y"))+25,
                x2=parseInt(node2.attr("x"))+25,
                y2=parseInt(node2.attr("y"))+25;

            var lineData=[
                       {x:x1,y:y1},
                       {x:x2,y:y2},
                    ];

            var svg = d3.select('svg');

            var defs = svg.append("defs");

            var textTip=svg.append("text")
                            .attr({
                                "x":(x1+x2)/2+10,
                                "y":(y1+y2)/2+10,
                                "stroke":"blue"
                            })
                            .text(text)
                            .transition()
                            .duration(1000)
                            .delay(1500)
                            .remove();


            var arrowMarker = defs.append("marker")
                                    .attr("id","arrow")
                                    .attr("markerUnits","strokeWidth")
                                    .attr("markerWidth","12")
                                    .attr("markerHeight","12")
                                    .attr("viewBox","0 0 12 12") 
                                    .attr("refX","6")
                                    .attr("refY","6")
                                    .attr("orient","auto");

            var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
                                    
            arrowMarker.append("path")
                        .attr("d",arrow_path)
                        .attr("fill","#000");

            //绘制直线
            var line = svg.append("line")
                         .attr("x1",x1)
                         .attr("y1",y1)
                         .attr("x2",x1)
                         .attr("y2",y1)
                         .attr("stroke","red")
                         .attr("stroke-width",2)
                         .attr("marker-end","url(#arrow)")
                         .transition()
                         .duration(1500)
                         .attr("x2",x2)
                         .attr("y2",y2)
                         .delay(1000)
                         .duration(1500)
                         .remove();

        }

    findDOMNode(host){
        var node,nameIndex;
        switch (host.name){
            case "Sir1":
                node=$("svg image[did='Server']");
              break;
            case "GATEWAY_1":
                console.log("DGW_A");
                node=$("svg image[did='DGW_A']");
                nameIndex="DGW_A";
                break;
            case "GATEWAY_2":
                node=$("svg image[did='DGW_B']");
                console.log("DGW_B");
                break;
            case "MEC1":
                node=$("svg image[did='MEC_A_sub1']");
                console.log("MEC_A_sub1");
                break;
            case "MEC2":
                node=$("svg image[did='MEC_A_sub2']");
                console.log("MEC_A_sub2");
                break;
            default:
                node={"x":60,"y":60};
                console.log("Sorry, cannot match");    
        }
        return node;
    }
};

window.painter = new Painter();