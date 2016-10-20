//账单
import React from 'react';
import { Form, Input, Card, Table, Button, DatePicker, Select } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import $ from 'jquery';
var username=window.userName; 


class debt extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {id:this.props.params.id, teamlist:[], data:[], moneyRecord:[], host:""};     
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
                  });
                }
                this.setState({teamlist:data.result.members,data:moneydata,knum:knum});         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
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
            var ns = this.state.selectedRows.length;
            var average = values.money/ns;            
            var members = "[";
            for (var i = this.state.selectedRows.length - 1; i >= 0; i--) {                            
               var member={};
               if (this.state.selectedRows[i].name==this.state.host) {
                    member.money=average*(ns-1)+parseInt(this.state.selectedRows[i].balance);
               }else{
                    member.money=this.state.selectedRows[i].balance-average;
               }
               member.provider=this.state.selectedRows[i].provider;
               member.user_id=this.state.selectedRows[i].key;               
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
                this.componentDidMount();      
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
    selectChange(name){
        console.log(`selected ${name}`);
        this.setState({host:name});
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
                                <FormItem
                                  wrapperCol={{ span: 12}}
                                  labelCol={{ span: 7 }}
                                  required
                                  label="选择付费人员"
                                  >
                                    <Select showSearch
                                    style={{ width: 200 }}
                                    placeholder="选择付费人员"
                                    optionFilterProp="children"
                                    notFoundContent="无法找到"
                                    onChange={this.selectChange.bind(this)}
                                    >
                                    {this.state.data.map(function(list, i) {
                                    return (
                                        <Option value={list.name}>{list.name}</Option>
                                        );
                                    }, this)}
                                    </Select>
                                </FormItem>
                                <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                                  <Button type="primary" onClick={this.start.bind(this)}>提交花费</Button>                                  
                                </FormItem>
                                </Form>
                            </div>
                            <Table rowSelection={rowSelection} columns={columns} dataSource={this.state.data} />
                        </div>
                    </Card>
                </div>            
    }
}
debt = Form.create()(debt)
export default debt;
