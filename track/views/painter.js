/***************************************************
 *                                                 *
 * Painter对象包含三个方法。                       *
 * tree()用于接收JSON格式数据，画出相应的网络拓扑；*
 * msg()：当某个节点的内容发生改变时动画冒泡提示； *
 * line():画线，type还未确定；                     *
 * unline():删除某条线；                           *   
 **************************************************/
class Painter
{
  log(text) { console.log(text); }

  tree(track, servers, proxies, stations)
  {
    console.log('draw a fucking tree');
    var tooltip = d3.select("body")  
                    .append("div")  
                    .attr("class","tooltip")  
                    .style("opacity",0.0)
                    .style("background-color","agba( 100, 149 ,237,0.5)");
    var width = 900,
        height = 700;

    var svg=d3.select("body")     //选择文档中的body元素
                .select("#contact-section").select(".container")
                .select("svg")     
                .attr({"width":width,
                        "height":height,
                   });
    var myNode =[];
    myNode.push(track);
    myNode.push(servers[0]);
    for (let proxy of proxies){
      myNode.push(proxy);
    }
    for(let station of stations){
      myNode.push(station)
    }

    console.log(myNode);


    var target = {};

    var nodeLength=myNode.length;
    console.log(myNode.length);
    var nodes=d3.range(0,nodeLength).map(function(i){
      // console.log(myNode[i]);
      if(myNode[i] instanceof Track){
          target.T=i;
          return{name:"Tracker",img:"./img/cloud-server.tm.png",data:"myNode[i]",x:700,y:100}
      }
      if(myNode[i] instanceof Server){
          target.S=i;
          return{name:"Server",img:"./img/cloud-server.tm.png",data:"myNode[i]",x:700,y:246}
      }
      if(myNode[i].name.substr(0,7)=="GATEWAY"){
          if(myNode[i].pos=="1"){
              target.A=i;
              return{name:"DGW_A",img:"./img/switch.tm.png" ,data:myNode[i].data, x:510,y:248}
          }else{
              target.B=i;
              return {name:"DGW_B",img:"./img/switch.tm.png", data:"",x:510,y:450}
          }
       }
       if(myNode[i].pos.length==2){
          if(myNode[i].name.substr(0,3) == "MEC" ){
              target[myNode[i].pos] = i;

              if(myNode[i].pos.substr(0,1)=="1"){
                  return {name:"MEC_A_sub"+myNode[i].pos.substr(1,2),img:"./img/MEC.tm.png",data:"",x:330 , y : myNode[i].pos.substr(1,2)==1 ? 145:295}
              }else{
                  return {name:"MEC_B_sub"+myNode[i].pos.substr(1,2),img:"./img/MEC.tm.png",data:"",x:330 , y : myNode[i].pos.substr(1,2)==1 ? 415:580}
              }
          }else if( myNode[i].name == "station" ){
              if( myNode[i].pos.substr(0,1)=="1" ){
                  return {
                    name:"station" , pos:myNode[i].pos, img:'./img/station.png',data:"",x:230 ,y : myNode[i].pos.substr(1,2)==1 ? 145:295
                  }
              }else{
                  return {
                    name:"station" , pos:myNode[i].pos, img:'./img/station.png',data:"",x:230 ,y : myNode[i].pos.substr(1,2)==1 ? 415:580
                  }
              }
          }
          
       }
    });

    console.log(JSON.stringify(nodes)+nodes.length);

    var edges = d3.range(1,nodeLength).map(function(i){
        // console.log("nodes["+i+"]"+JSON.stringify(nodes[i]))
        if(nodes[i].name == "Server"){
            return {source: i, target: target.T };
        }
        if(nodes[i].name == "DGW_A"){
            return {source: i, target: target.S };
        }if(nodes[i].name == "DGW_B"){
            return {source: i, target: target.S };
        }if(nodes[i].name == "station"){
            return {source: i, target: target[nodes[i].pos]};
        }
        else if(nodes[i].name.substr(0,9)=="MEC_A_sub"){
          var temTar1= target.A==undefined ? target.S:target.A;
          return {source:i,target:temTar1}
        }else if(nodes[i].name.substr(0,9)=="MEC_B_sub"){
          var temTar2= target.B==undefined ? target.S:target.B;
          return {source:i,target:temTar2}
        }
    })

    // console.log("edges: "+JSON.stringify(edges))

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
    // console.log(nodes);
    // console.log(edges);
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
                        .attr("dx",10)
                        .attr("dy",15)
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
        svg_nodes_img.attr("x",function(d){d.fixed = true; return d.x-25})
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

  // src & dst are object-reference to a User/Server/Proxy
  line(src, dst, type, text)
  {
    var linkTooltip = d3.select("body")  
                     .append("div")  
                     .attr("class","linkTooltip")  
                     .style("opacity",0.0); 
    var lineColor,dx,dy;
    switch(type){
      case "ping":
        lineColor="pink"; dx=0;dy=0;break;
      case "pong":
        lineColor="yellow"; dx=0;dy=0;break;
      case "fetch":
        lineColor="red"; dx=0;dy=0;break;
      case "offer":
        lineColor="blue"; dx=0;dy=0;break;
    }

    var node1=this.findDOMNode(src);
    var node2=this.findDOMNode(dst);

    var x1=parseInt(node1.attr("x"))+25,
        y1=parseInt(node1.attr("y"))+25,
        x2=parseInt(node2.attr("x"))+25,
        y2=parseInt(node2.attr("y"))+25;

    if(x1-x2>30){ x1-=20+dx; x2+=23+dx; }
    if(y2-y1>60){ y2-=20+dy; y1+=18+dy; }
    if(y1-y2>60){ y1-=20+dy; y2+=18+dy; }
    if(x2-x1>30){ x2-=20+dx; x1+=23+dx; }

    var lineData=[
               {x:x1,y:y1},
               {x:x2,y:y2},
            ];

    var svg = d3.select('svg');

    var defs = svg.append("defs");

    var textTip=svg.append("text")
                    .attr({
                        "x":(x1+x2)/2+10,
                        "y":(y1+y2)/2+20,
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
    var lidTemp = (src.name==undefined? "Tracker": src.name )+ (dst.name==undefined? "Tracker": dst.name );
    //绘制直线
    
    
    var line = svg.append("line")
                 .attr('lid',function(){
                    return lidTemp;
                  })
                 .attr("x1",x1)
                 .attr("y1",y1)
                 .attr("x2",x1)
                 .attr("y2",y1)
                 .attr("stroke",lineColor)
                 .attr("stroke-width",2)
                 .attr("marker-end","url(#arrow)")
                 .transition()
                 .duration(1500)
                 .attr("x2",x2)
                 .attr("y2",y2);
                 // .delay(1000)
                 // .duration(1500)
                 // .remove();
  }

  unline(src, dst)
  {
    var node1=this.findDOMNode(src,"delete");
    var node2=this.findDOMNode(dst);

    var lidTemp = (src.name==undefined? "Tracker": src.name )+ (dst.name==undefined? "Tracker": dst.name );

    var line = $("svg line[lid='"+lidTemp+"']").remove();

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
    var offsetTop = node.position().top;
    var offsetLeft = node.position().left;
    
    d3.select(".msgTooltip").html(nameIndex+": "+type+"-"+text)
        .style("left",offsetLeft+ "px")  
        .style("top", offsetTop-60+"px")
        .style("opacity",1.0);

    setTimeout(()=>{
        d3.select(".msgTooltip").html(nameIndex+": "+type+"-"+text)
            .style("opacity",0);
    },3000);
  }

  //找出相应的host对应的DOM节点
  findDOMNode(host,type){
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
              if(host.pos=="11"){
                node=$("svg image[did='MEC_A_sub1']");
                console.log("MEC_A_sub1");
              }else{
                node=$("svg image[did='MEC_B_sub1']");
                console.log("MEC_B_sub1");
              } 
              break;
          case "MEC2":
              if(host.pos=="12"){
                node=$("svg image[did='MEC_A_sub2']");
                console.log("MEC_A_sub2");
              }else{
                node=$("svg image[did='MEC_B_sub2']");
                console.log("MEC_B_sub2");
              } 
              break;
          default:
              if(host instanceof User){
                if(type=="delete"){
                  node=$("svg image[did='User']").fadeOut(3000);

                }else{
                  var svg=d3.select('svg');
                  var userNode=svg.append('image')
                                  .attr("width",50)
                                  .attr("height",50)
                                  .attr("xlink:href","./img/phone.png")
                                  .attr("x",50)
                                  .attr("y",150)
                                  .attr("did","User");
                  node=$("svg image[did='User']");
                  console.log("User in FE"); 
                }    
              }else{
                node=$("svg image[did='Tracker']");
                console.log("Tracker");  
              }
              
      }
      return node;
  }

};

// delete this :D
class Mrsuyi_Tmp_Painter
{
  log(text) { console.log(text); }

  tree(track, servers, proxies)
  {
    console.log('draw a fucking tree');
  }

  // src & dst are object-reference to a User/Server/Proxy

  line(src, dst, type, text)
  {

  }

  unline(src, dst)
  {

  }

  msg(src, type, text)
  {
    
  }
};