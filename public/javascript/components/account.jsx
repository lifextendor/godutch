//账单
import React from 'react';
import { Form, Input, Card, Table, Button, DatePicker } from 'antd';
const FormItem = Form.Item;
import $ from 'jquery';
var username=window.userName; 


class account extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {id:this.props.params.id, teamlist:[], data:[], moneyRecord:[]};     
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
            if (this.state.selectedRows<=0) {
                return;
            }          
            var ns = 0;
            for (var i = this.state.selectedRows.length - 1; i >= 0; i--) {
                ns+=parseInt(this.state.selectedRows[i].num.n);
            }
            var average = values.money/ns; 
            if (e.target.innerText=="花 费") {
                average=-average;
            }            
            var members = "[";
            for (var i = this.state.selectedRows.length - 1; i >= 0; i--) {
                           var member={};
                           member.provider=this.state.selectedRows[i].provider;
                           member.user_id=this.state.selectedRows[i].key;
                           member.money=average*this.state.selectedRows[i].num.n+parseInt(this.state.selectedRows[i].balance);
                           var json='{"provider":"'+member.provider+'","user_id":"'+member.user_id+'","money":"'+member.money+'"}';
                           members+=json;
                           if (i>0) {members+=","};
                       }   
            members+="]";        
            $.ajax({
            url: "/users/group/"+this.state.id+"/updatemoney",
            dataType: 'json',
            type: 'put',
            async: true,
            data: {total:values['money'],members:members,dateTime:values.time},
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
        var newdata=this.state.data;
        for (var i = this.state.data.length - 1; i >= 0; i--) {
            if(e.target.id==newdata[i].key){
                newdata[i].num.k=e.target.id;
                newdata[i].num.n=e.target.value;
            }
        }
        this.setState({data:newdata});
    }
    render(){
        var that=this;
        const { getFieldProps } = this.props.form;
        const moneyProps = getFieldProps('money', {
          rules: [
            { required: true, message: '金额必须是数字' },
          ],
        });
        const timeProps = getFieldProps('time', {
          // rules: [
          //   { required: true, message: '必须选时间' },
          // ],
          initialValue:new Date().getFullYear()+"-"+(parseInt(new Date().getMonth())+parseInt(1))+"-"+new Date().getDate(),
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
                                  <DatePicker {...timeProps} name="time" format="yyyy-MM-dd" />
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
