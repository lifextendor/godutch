//团队管理
import React from 'react';
import { Card, Collapse, Button, Icon, Affix,  Popconfirm, message } from 'antd';
import {Link} from 'react-router';
const Panel = Collapse.Panel;
var username=window.userName;

class numManage extends React.Component{ 
    constructor(props) {
        super(props);        
        this.state={id:this.props.params.id,numList:[],power:'hidden'};
    }
    succesMessage() {
      return notification['success']({
          message: '成功',
          description: '操作成功！',
        });
    }
    errorMessage() {
      return notification['error']({
          message: '失败',
          description: '操作失败！',
        });
    }
    infoMessage() {
      return notification['info']({
          message: '提示',
          description: '取消操作！',
        });
    } 
    componentDidMount(){
        $.ajax({
            url: "/users/group/"+this.props.params.id,
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                debugger
                if (data.result.grant==='CAPTAIN') {
                    this.setState({numList:data.result.members,power:'ok'});
                }else{
                    this.setState({numList:data.result.members,power:'hidden'});
                }
                         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    componentWillUnmount() {
        // this.serverRequest.abort();
    }
    expelGroupYes(provider,user_id) {
        debugger
        $.ajax({            
            url: "/users/group/"+this.state.id+"/deletemember",
            dataType: 'json',
            type: 'POST',
            data:{provider:provider,user_id:user_id},
            success: function(data) {
                debugger
                this.componentDidMount();
                this.setState({numList:this.state.numList});
                this.succesMessage();
            }.bind(this),
            error: function(xhr, status, err) {
                debugger
                console.log(this.props.url, status, err.toString());
                this.errorMessage();
            }.bind(this)
        });
    }
    powerGroupYes(provider,user_id) {
        $.ajax({
            url: "/users/group/"+id+"/authorize",
            dataType: 'json',
            type: 'POST',
           data:'{member:{provider:'+provider+',user_id:'+user_id+'}}',
            success: function(data) {
                debugger
                this.componentDidMount();
                this.setState({numList:this.state.numList});
                this.succesMessage();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
                this.errorMessage();
            }.bind(this)
        });        
    }
    cancel() {
        this.infoMessage();  
    }    
    render(){
        return  <div style={{ background: '#ECECEC'}}>                    
                    <Card className="main-panel" title="团队" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                            <Card title="团员列表">
                                <Collapse accordion>
                                 {this.state.numList.map(function(list, i) {
                                return (
                                    <Panel header={list.user_name} key={i}>
                                        <div className={this.state.power}>
                                        <Popconfirm title="确定要开除这个团员吗？" onConfirm={this.expelGroupYes.bind(this,list.provider,list.userId)} onCancel={this.cancel.bind(this)}>
                                            <Button className="tool-button"  type="primary">开除</Button>
                                        </Popconfirm>                                        
                                        &nbsp;
                                        <Popconfirm title="确定要给这个团员授权吗？" onConfirm={this.powerGroupYes.bind(this,list.provider,list.userId)} onCancel={this.cancel.bind(this)}>
                                        <Button className="tool-button" type="primary">授权</Button> 
                                        </Popconfirm>
                                        </div>                           
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
// numManage.defaultProps={myList:myList};//设置默认属性
export default numManage;
