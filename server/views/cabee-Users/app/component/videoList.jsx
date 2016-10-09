import React from 'react';
import {Link} from 'react-router';

//TODO:应该通过Ajax请求得到server中的所有视频信息,再通过react-router中的/:id来连接到视频详情
var videos=[
	{name:"video1",blocks:"5",videoId:"1001"},
	{name:"video2",blocks:"5",videoId:"1002"},
]


class videoList extends React.Component{
	constructor(props, context) {
		super(props, context);

		this.state = {
			videos:[]
		};
	}

	componentDidMount(){
		//TODO:通过Ajax请求获取要播放的视频内容信息
	    $.ajax({
	    	type: "get",
			url: "/video",
			dataType: 'json',
			cache: false,
			success: function(data) {
				console.log("data="+JSON.stringify(data));
				this.setState({
					videos:data
				});
				console.log("success")
			}.bind(this),
			error: function(xhr, status, err) {
				console.error("/video", status, err.toString());
			}.bind(this)
	    });
	}

	getVideolist(){
		console.log("get list");
		const {videos}=this.state;
		var item,video,videoList=[];
		for(var key in videos){
			item=videos[key];
			video=(
			<tr key={key}>
				<td className="text-center">{key}</td>
				<td className="text-center">{item.length}</td>
				<td className="text-center">
					<Link to={"/videos/detail/"+key}>
						<span className="btn btn-default">Play</span>
					</Link>
				</td>
			</tr>
			)
			videoList.push(video);
		}
		return videoList;
							
		
	}

	render(){
		var HStyle={
	        textAlign:'center',
	    }
	    var lists=this.getVideolist();
		return(	
			<div>
				<h2  style={HStyle}>Videolist</h2>
				<div className='StatusTable'>
					<div className="table-responsive">
						<table className="table table-bordered">
							<thead>
								<tr className="info"> 
									<th>VideoName</th>
									<th>how many blocks</th>
									<th>play</th>
								</tr>
							</thead>
							<tbody>
								{
									lists
								}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			
			
		)
	}
}

export default videoList;