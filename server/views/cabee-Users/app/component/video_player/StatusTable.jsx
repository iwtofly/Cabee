import React from 'react';
import pubsub from 'pubsub-js';



var StatusTable=React.createClass({
	getInitialState: function() {
	return {
		videoIndex:0,
		info:[]
		}
	},
	componentWillMount: function() {
	this.pubsub_token1 = pubsub.subscribe('index', function(topic, videoIndex) {
	  // update my selection when there is a message
	  this.setState({ videoIndex: videoIndex });
	}.bind(this));

	this.pubsub_token2 = pubsub.subscribe('status', function(topic, pubInfo) {
	  // update my selection when there is a message
	  this.setState({ info:pubInfo });
	}.bind(this));


	// console.log("videoIndex:  "+this.state.videoIndex)
	
	},
	componentWillUnmount: function() {
	// React removed me from the DOM, I have to unsubscribe from the pubsub using my token
	pubsub.unsubscribe(this.pubsub_token1);
	pubsub.unsubscribe(this.pubsub_token2);

	},
	getIndex:function(){
		return(this.state.videoIndex);
		
	},
	render: function() {
		var index=this.getIndex();
		var bufProgress;

		var List=this.state.info.map((info,n)=>{
			if (this.state.info[n].buf < 0 ) {
				bufProgress = 0;
			} else {
				bufProgress = Math.abs(Math.floor(this.state.info[n].buf*10)/10) ;
			};
			return(
				<tr key={n}>
					<td>{n+1}</td>
					<td>{bufProgress}%</td>
				</tr>
			)
		})
		return (
			<div className='StatusTable'>
				<div className="table-responsive">
					<table className="table table-bordered">
						<thead>
							<tr className="info"> 
								<th>FileIndex</th>
								<th>buffer-progress</th>
							</tr>
						</thead>
						<tbody>
							{List}
						</tbody>
					</table>
				</div>
			</div>

		)
	}
})

export default StatusTable;