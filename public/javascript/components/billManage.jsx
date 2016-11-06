//账单
import React from 'react';
import { Card, Table, Button, Form, DatePicker } from 'antd';
const FormItem = Form.Item;
var username=window.userName;

const columns = [
    {title: '时间',dataIndex: 'time',width:'30%'}, 
    {title: '消费记录',dataIndex: 'mark',width:'70%'}
    ];

class billManage extends React.Component{ 
    constructor(props) {
        super(props); 
        this.state = {list:[]};    
    }
    query(){
      this.props.form.validateFields((errors, values) => {
        debugger
        var starttime = (new Date(values.starttime)).toLocaleDateString() + " 00:00:00";
        starttime = (new Date(starttime)).getTime();
        var endtime = (new Date(values.endtime)).toLocaleDateString() + " 23:59:59";
        endtime = (new Date(endtime)).getTime();
        $.ajax({
            url: "/users/bills/from/"+ starttime +"/to/" + endtime,
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                debugger 
                var list = [];               
                for (var i = data.result.length - 1; i >= 0; i--) {
                    var lis = data.result[i];
                    var li={};
                    var one = [];
                    li.time=(new Date(lis.datetime)).toLocaleDateString();                    
                    for (var j = lis.members.length - 1; j >= 0; j--) {
                      var mark = lis.members[j]["name"]+' 消费：'+lis.members[j]["money"]+'；';
                      one.push(mark);
                    }
                    li.mark=one;
                    list.push(li);
                }                
                this.setState({list:list});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        }); 
      });    
    }      
    render(){
        const { getFieldProps } = this.props.form;
        const starttime = getFieldProps('starttime', {
          initialValue:new Date().getFullYear()+"-"+(parseInt(new Date().getMonth())+parseInt(1))+"-"+(new Date().getDate()-1),
        });
        const endtime = getFieldProps('endtime', {
          initialValue:new Date().getFullYear()+"-"+(parseInt(new Date().getMonth())+parseInt(1))+"-"+new Date().getDate(),
        });
        return  <div style={{ background: '#ECECEC'}}>
                    <Card className="main-panel" title="账单" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                        <Form horizontal form={this.props.form}>                        
                        <FormItem 
                          wrapperCol={{ span: 12}}
                          labelCol={{ span: 7 }}
                          required
                          label="开始时间" 
                        >
                          <DatePicker {...starttime} name="starttime" format="yyyy-MM-dd" />
                        </FormItem>
                        <FormItem 
                          wrapperCol={{ span: 12}}
                          labelCol={{ span: 7 }}
                          required
                          label="结束时间" 
                        >
                          <DatePicker {...endtime} name="endtime" format="yyyy-MM-dd" />
                        </FormItem>
                        <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                          <Button type="primary" onClick={this.query.bind(this)}>查询</Button>                                  
                        </FormItem>
                        </Form>                         
                        <Table columns={columns} dataSource={this.state.list} />
                        </div>
                    </Card>
                </div>            
    }
}
billManage = Form.create()(billManage)
export default billManage;
