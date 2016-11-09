import React from 'react';

import VideoPlayer from '../component/video_player/video_player.jsx'
import StatusTable from '../component/video_player/StatusTable.jsx'


var urlList1=[
  {"url":"/video/shit/movie.mp4",
  "text":"movie","duration":26},
  {"url":"/video/shit/movie1.mp4","text":"movie1","duration":26}
];

//时长的URL形式: http://localhost:40001/video/time/shit/1.mp4

// class Video_Cached extends React.Component {
class Video_Cached extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      videoId:this.props.params.videoId,
      currentUrlList:[],
      videos:null,
      fileName:"",
      loading:true,
      duration:0
    };
    this.duration=0;
  }

  componentWillMount(){
    var videoId=this.state.videoId;
    $.ajax({
        type: "get",
        url: "/video",
        dataType: 'json',
        cache: false,
        success: function(data) {
            var tempUrlList=data[videoId];
            var tempText,urlList=[];
            for(var i = 0 ; i < tempUrlList.length ; i++){

                tempText=tempUrlList[i];
                tempUrlList[i]="/video/"+this.state.videoId+"/"+tempUrlList[i];
                urlList.push({});
                urlList[i].url=tempUrlList[i];
                urlList[i].text=tempText.substr(0,tempText.length-4);
                var a= this.getVideoTime(this.state.videoId , tempText);
                console.log("this is time : "+a);
                urlList[i].duration=this.state.duration;
            }
            this.setState({
                videos:data,
                currentUrlList:urlList,
            });
            console.log("success")

            this.setState({
                loading:false
            })
        }.bind(this),
        error: function(xhr, status, err) {
            // console.error("/video", status, err.toString());
            console.log("err");
        }.bind(this)
    });

    this.setState({
        fileName:this.state.videoId,
    })


  }

  getVideoTime(videoId,videoPiece){
    var that = this;
    console.log("videoId:"+videoId);
    $.ajax({
      url: '/video/time/'+videoId+"/"+videoPiece,
      type: 'GET',
      dataType: 'json',
      async: false,
      success:function(data){
        that.setState({
          duration:data
        })
        console.log("success");
        return data;
      }.bind(this),
      error: function(xhr, status, err) {
            // console.error("/video", status, err.toString());
            console.log("err");
      }.bind(this)
    })

  }

  render() {
    var HStyle={
      textAlign:'center',
    }
    const { currentUrlList, loading ,duration } = this.state ;
    console.log(JSON.stringify(currentUrlList));
    return (
    <div>
    {
        loading && !duration &&
        <div>正在获取视频···</div>
    }
    { !loading && duration &&
        <div>
          <h2  style={HStyle}>{this.state.videoId}</h2>
          <VideoPlayer urlList={currentUrlList}/>
          <StatusTable/>
       </div>
    }
    </div>

    );
  }
}

export default Video_Cached;