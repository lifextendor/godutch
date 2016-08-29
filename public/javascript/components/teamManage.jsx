//团队管理
import React from 'react';
import { Card, Collapse, Button, message, Popconfirm } from 'antd';
import {Link} from 'react-router';
import $ from 'jquery';
import '../stylesheets/teamManage.scss'
const Panel = Collapse.Panel;

var teamlist=[
    {name:"团1",num:"8",id:"1",ishead:true}, 
    {name:"团1",num:"8",id:"2",ishead:true},
    {name:"团1",num:"8",id:"3",ishead:true},
    {name:"团1",num:"8",id:"4",ishead:true},
    {name:"团1",num:"8",id:"5",ishead:false},
    {name:"团1",num:"8",id:"6",ishead:false},
    {name:"团1",num:"8",id:"7",ishead:false},
    {name:"团1",num:"8",id:"8",ishead:false},
    {name:"团1",num:"8",id:"9",ishead:false},
    {name:"团1",num:"8",id:"10",ishead:false},
    {name:"团1",num:"8",id:"11",ishead:false},
    {name:"团1",num:"8",id:"12",ishead:false},
    {name:"团1",num:"8",id:"13",ishead:false},
    {name:"团1",num:"8",id:"14",ishead:false},
    {name:"团2",num:"9",id:"15",ishead:false},
    {name:"团3",num:"10",id:"16",ishead:false}
    ]; 

class teamManage extends React.Component{ 
    constructor(props) {
        super(props);
        this.state={username: this.props.params.username, teamlist: teamlist}; 
    }
    confirm(e) {
      message.success('点击了确定');
    }

    cancel(e) {
      message.error('点击了取消');
    }
    // handleCommentSubmit: function(comment) {
    //     alert("确认提交");
    //     $.ajax({
    //         url: this.props.url,
    //         dataType: 'json',
    //         type: 'POST',
    //         data: comment,
    //         success: function(data) {
    //             this.setState({data: data});
    //         }.bind(this),
    //         error: function(xhr, status, err) {
    //             this.setState({data: comments});
    //             console.error(this.props.url, status, err.toString());
    //         }.bind(this)
    //     });
    // }
    render(){
        var permissions=[]; 
        {this.state.teamlist.map(function(list, i) {
            permissions[i]=list.ishead?"hidden":"ok";
        }, this)}
        return  <div style={{ background: '#ECECEC'}}>                    
                    <Card className="main-panel" title="团队" bordered={false}>                        
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                        <Card title="团组列表">
                            <Collapse accordion>
                             {this.state.teamlist.map(function(list, i) {
                            return (
                                <Panel header={list.name} key={i}>
                                    <p>创于2016年7月1日</p>
                                    <p>简介：啦啦啦</p>
                                    <Popconfirm title="确定要退出这个团吗？" onConfirm={this.confirm.bind(this)} onCancel={this.cancel.bind(this)}>
                                    <Button className="tool-button" type="primary" >退团</Button>
                                    </Popconfirm>
                                    <div className={permissions[i]} style={{display: 'inline'}}>
                                    &nbsp;
                                    <Popconfirm title="确定要退出解散这个团吗？" onConfirm={this.confirm.bind(this)} onCancel={this.cancel.bind(this)}>
                                    <Button className="tool-button" type="primary">解散团</Button>
                                    </Popconfirm>
                                    </div>
                                    &nbsp;                                    
                                    <Button className="tool-button" type="primary"><Link to={'numManage/'+i+'/'+permissions[i]}>查看团员</Link></Button>
                                     &nbsp;                                    
                                    <Button className="tool-button" type="primary"><Link to={'numManage/'+i+'/'+permissions[i]}>邀请团成员</Link></Button>                                  
                                </Panel>
                                );
                            }, this)} 
                            </Collapse>                                
                        </Card>
                        </div>                      
                    </Card>
                </div>            
    }
}
export default teamManage;
