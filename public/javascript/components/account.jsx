//账单
import React from 'react';
import { Form, Input, Card, Table, Button, DatePicker } from 'antd';
const FormItem = Form.Item;
// import $ from 'jquery';
var username=window.userName;  



class account extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {id:this.props.params.id, teamlist:[], data:[], moneyRecord:[], knum:[]};     
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
                    remarks: '备注',
                    num:{"n":"1","k":data.result.members[i].userId},
                  });
                    debugger
                    knum[data.result.members[i].userId]="1";
                }
                this.setState({teamlist:data.result.members,data:moneydata,knum:knum});         
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
            debugger
            console.log(values);
            if (!!errors) {
                this.errorMessage();
                console.log('Errors in form!!!');
                return;
            }            
            console.log(this.state.selectedRows);
            $.ajax({
            url: "/users/group/"+this.state.id+"/updatemoney",
            dataType: 'json',
            type: 'put',
            async: true,
            data: {total:values['money'],members:[{provider:'qq',user_id:1,money:10}],dataTime:121321313},
            success: function(data) {
                debugger
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
        });        
    }       
    inputChange(e){
        debugger
        var onum=this.state.knum;
        onum[e.target.id]=e.target.value;
        this.setState({knum:onum});
    }
    render(){
        var that=this;
        const { getFieldProps } = this.props.form;
        const moneyProps = getFieldProps('money', {
          rules: [
            { required: true, message: '金额必须是数字' },
          ],
        });
        const rowSelection = {
            onChange(selectedRowKeys, selectedRows) {              
                that.setState({selectedRows:selectedRows});
            }
        }
        const columns = [
        {title: '姓名',dataIndex: 'name'}, 
        {title: '类型',dataIndex: 'provider'}, 
        {title: '余额',dataIndex: 'balance'}, 
        {
            title: '人数',
            dataIndex: 'num',
            width: 70,
            render: (num) => <Input id={num.k} value={num.n} onChange={this.inputChange.bind(this)}/>,
          },
        {title: '备注',dataIndex: 'remarks'}
        ];
        return  <div style={{ background: '#ECECEC'}}>
                    <Card className="main-panel" title="账单管理" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                            <div style={{ marginBottom: 16 }}>
                                <Form horizontal form={this.props.form}>
                                <FormItem
                                  wrapperCol={{ span: 8}}
                                  labelCol={{ span: 7 }}
                                  label="输入金额"                              
                                >
                                  <Input {...moneyProps} placeholder="金额" name="money"/>
                                </FormItem>
                                <FormItem 
                                  wrapperCol={{ span: 12}}
                                  labelCol={{ span: 7 }}
                                  required
                                  label="选择时间" 
                                >
                                  <DatePicker />
                                </FormItem>
                                <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                                  <Button type="primary" onClick={this.start.bind(this)}>花费</Button>
                                  &nbsp;&nbsp;&nbsp;
                                  <Button type="primary" onClick={this.start.bind(this)}>充值</Button>
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
