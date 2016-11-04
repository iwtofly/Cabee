import React from 'react';

import VideoPlayer from '../component/video_player/video_player.jsx'
import StatusTable from '../component/video_player/StatusTable.jsx'


var urlList=[
  {text:"video1" ,duration:204 ,
  url:'http://220.167.105.121/170/2/11/acloud/151672/letv.v.yinyuetai.com/he.yinyuetai.com/uploads/videos/common/6609014F06AE1C8E99DE142502A2B157.flv?crypt=95aa7f2e98550&b=1314&nlh=3072&nlt=45&bf=6000&p2p=1&video_type=flv&termid=0&tss=no&geo=CN-23-323-1&platid=0&splatid=0&its=0&qos=5&fcheck=0&proxy=3062324601,2101603530,3683272595&uid=3063271287.rp&keyitem=GOw_33YJAAbXYE-cnQwpfLlv_b2zAkYctFVqe5bsXQpaGNn3T1-vhw..&ntm=1447949400&nkey=55c24f4c47dd315085c383e07750f67e&nkey2=3344c026a5c147651522c75bc51fb700&sc=0e90a16b75f7bc55&br=3136&vid=782863&aid=1559&area=KR&vst=0&ptp=mv&rd=yinyuetai.com?sc=0e90a16b75f7bc55&errc=0&gn=1065&buss=106551&cips=182.149.207.119&lersrc=MTI1Ljg5Ljc0LjE3MQ==&tag=yinyuetai&cuhost=letv.v.yinyuetai.com&cuid=151672&flw3x=0&sign=coopdown&fext=.flv&br=3136&ptp=mv&rd=yinyuetai.com',
  poster: 'http://thumbnails.thisisepic.com/b1ce00de-e687-4c1b-97ac-afa05a287327/large/frame_0005.png'},
  {text:"video2" ,duration:188 ,
  url:'http://videos.thisisepic.com/2b9c1bf3-e19b-4be5-9d36-246c5d3607d8/high.mp4',
  poster: 'video/MY_VIDEO_POSTER.jpg'}
];
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
    };
  }

  componentDidMount(){
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
                urlList[i].duration=(function(){
                  $.ajax({
                    url: 'http://localhost:40001/video/time/'+this.state.videoId+"/"+tempUrlList[i],
                    type: 'GET',
                    dataType: 'json',
                    success:function(data){
                      return data;
                    }
                  })
                  .done(function() {
                    console.log("success");
                  })
                  .fail(function() {
                    console.log("error");
                  })
                  .always(function() {
                    console.log("complete");
                  });
                })();
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

  render() {
    var HStyle={
      textAlign:'center',
    }
    const { currentUrlList, loading } = this.state ;
    console.log(JSON.stringify(currentUrlList));
    return (
    <div>
    {
        loading &&
        <div>正在获取视频···</div>
    }
    { !loading &&
        <div>
          <h2  style={HStyle}>{this.state.videoId}</h2> {/*后期需要改成获取到的videoName*/}
          <VideoPlayer urlList={currentUrlList}/> {/*后期需要改成this.state.urlList*/}
          <StatusTable/>
       </div>
    }
    </div>

    );
  }
}

export default Video_Cached;