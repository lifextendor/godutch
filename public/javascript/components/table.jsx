//账单
import React from 'react';
import { Card, Table } from 'antd';


class table extends React.Component{ 
    constructor(props) {
        super(props);   
        this.state = {id:this.props.params.id, data:[]};         
    } 
    componentDidMount(){
        $.ajax({
            url: "/users/group/"+this.state.id,
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                const moneydata = [];
                const knum = {};
                for (var i = data.result.members.length - 1; i >= 0; i--) {
                    moneydata.push({
                    key: data.result.members[i].userId,
                    name: data.result.members[i].user_name,
                    provider: data.result.members[i].provider,
                    balance: data.result.members[i].money,
                  });
                }
                this.setState({data:moneydata});         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    render(){
        const columns = [
        {title: '姓名',dataIndex: 'name'}, 
        {title: '类型',dataIndex: 'provider'}, 
        {title: '余额',dataIndex: 'balance'}
        ];
        return  <div style={{ background: '#ECECEC'}}>
                    <Card className="main-panel" title="记账" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-0 col-md-8 col-sm-12">                            
                            <Table columns={columns} dataSource={this.state.data} />
                        </div>
                    </Card>
                </div>            
    }
}
export default table;
