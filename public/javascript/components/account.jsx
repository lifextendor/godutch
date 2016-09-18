//账单
import React from 'react';
import { Form, Input, Card, Table, Button } from 'antd';
const FormItem = Form.Item;
// import $ from 'jquery';
var username=window.userName;  

const columns = [
    {title: '姓名',dataIndex: 'name'}, 
    {title: '余额',dataIndex: 'balance'}, 
    {
        title: '人数',
        dataIndex: 'num',
        width: 70,
        render: () => <Input value="1" />,
      },
    {title: '备注',dataIndex: 'remarks'}
    ];

class account extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {id:this.props.params.id, selectedRowKeys: [], teamlist:[], data:[], moneyRecord:[]};     
    }
    componentDidMount(){
        $.ajax({
            url: "/users/group/"+this.state.id,
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                debugger
                const moneydata = [];
                for (var i = data.result.members.length - 1; i >= 0; i--) {
                    moneydata.push({
                    key: data.result.members[i].userId,
                    name: data.result.members[i].user_name,
                    balance: data.result.members[i].money,
                    remarks: '备注',
                  });
                }
                this.setState({teamlist:data.result.members,data:moneydata});         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    handleChange(name) {
      console.log(`selected ${name}`);      
    }
    start(e) {        
        this.props.form.validateFields((errors, values) => {
            console.log(values);
            if (!!errors) {
                this.errorMessage();
                console.log('Errors in form!!!');
                return;
            }
            debugger
            $.ajax({
            url: "/users/group/"+this.state.id+"/updatemoney",
            dataType: 'json',
            type: 'put',
            async: true,
            data: {total:values['money'],members:[{provider:'qq',user_id:1,money:10}],dataTime:121321313},
            success: function(data) {
                const moneydata = [];
                for (var i = data.result.members.length - 1; i >= 0; i--) {
                    moneydata.push({
                    key: i,
                    name: data.result.members[i].user_name,
                    balance: data.result.members[i].money,
                    remarks: '备注',
                  });
                }
                this.setState({data:moneydata});         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
        this.setState({selectedRowKeys: []});                
        });        
    }     
    onSelectChange(selectedRowKeys) {
        debugger
        var moneyRecord=[];
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        for (var i = selectedRowKeys.length - 1; i >= 0; i--) {
                for (var j = this.state.teamlist.length - 1; j >= 0; j--) {
                        if (this.state.teamlist[j].userId===selectedRowKeys[i]) {
                            moneyRecord.push({id:selectedRowKeys[i],provider:this.state.teamlist[j].provider})    
                        }
                    }                       
               }       
        this.state={moneyRecord:moneyRecord};
    }
    render(){
        const { getFieldProps } = this.props.form;
        const moneyProps = getFieldProps('money', {
          rules: [
            { required: true, min: 2, max: 8, message: '用户名在2至8个字符之间' },
          ],
        });
        const formItemLayout = {
          labelCol: { span: 7 },
          wrapperCol: { span: 12 },
        };
        const {selectedRowKeys} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange.bind(this),
        };
        const hasSelected = selectedRowKeys.length > 0;
        return  <div style={{ background: '#ECECEC'}}>
                    <Card className="main-panel" title="账单管理" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                            <div style={{ marginBottom: 16 }}>
                                <Form horizontal form={this.props.form}>
                                <FormItem
                                  {...formItemLayout}
                                  label="输入金额"                              
                                >
                                  <Input {...moneyProps} placeholder="金额" name="money"/>
                                </FormItem>
                                <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                                  <Button disabled={!hasSelected} type="primary" onClick={this.start.bind(this)}>花费</Button>
                                  &nbsp;&nbsp;&nbsp;
                                  <Button disabled={!hasSelected} type="primary" onClick={this.start.bind(this)}>充值</Button>
                                  <span style={{ marginLeft: 8 }}>{hasSelected ? `选择了 ${selectedRowKeys.length} 个团员` : ''}</span>
                                </FormItem>
                                </Form>
                            </div>
                            <Table rowSelection={rowSelection} columns={columns} dataSource={this.state.data} />
                        </div>
                    </Card>
                </div>            
    }
}
account = Form.create()(account)
export default account;
