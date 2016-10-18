//账单
import React from 'react';
import { Card, Table, Button, Select } from 'antd';
const Option = Select.Option;
var username=window.userName;

class Messages extends React.Component{
    constructor(props) {
        super(props);
        this.state = {id:this.props.params.id, selectedRowKeys: [], teamlist:[], data:[],
            isaccount:'hidden',ispower:'hidden',isselect:''};
    }
    componentDidMount(){
        $.ajax({
            url: "/users/group/"+this.state.id,
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                const moneydata = [];
                for (var i = data.result.members.length - 1; i >= 0; i--) {
                    moneydata.push({
                        key: i,
                        name: data.members[i].user_name,
                        balance: data.members[i].money,
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
        for (var i = this.state.teamlist.length - 1; i >= 0; i--) {
            if (name==this.state.teamlist[i].id) {
                if (this.state.teamlist[i].ishead) {
                    this.setState({ispower:'ok'});
                }
                else{
                    this.setState({ispower:'hidden',isaccount:'hidden',isselect:''});
                }
                break;
            }
        }
    }
    start(e) {
        this.setState({loading: true});
        // 模拟 ajax 请求，完成后清空
        setTimeout(() => {
            this.setState({
                selectedRowKeys: [],
            });
        }, 1000);
    }
    account(e){
        this.setState({isaccount:'ok',isselect:'rowSelection={rowSelection}'});

    }
    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    }
    render(){
        const {selectedRowKeys} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange.bind(this),
        };
        const hasSelected = selectedRowKeys.length > 0;
        const options = this.state.teamlist.map(d => <Option key={d.id}>{d.groupName}</Option>);
        var isnew="", ishead=false;
        {this.state.teamlist.map(function(d, i) {
            if(d.isnew){
                isnew=d.groupName;
                if(d.grant==='CAPTAIN'){
                    ishead=true;
                    this.state.ispower='ok';
                };
                return;
            };
        }, this)}
        return  <div style={{ background: '#ECECEC'}}>
            <Card className="main-panel" title="账单管理" bordered={false}>
                <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                    <span>选择团</span>
                    <Select showSearch
                            style={{ width: 200,marginBottom:20 }}
                            placeholder="请选择团"
                            optionFilterProp="children"
                            notFoundContent="无法找到"
                            onChange={this.handleChange.bind(this)}
                            defaultValue={isnew}
                        >
                        {options}
                    </Select>
                    &nbsp;&nbsp;&nbsp;
                    <Button type="primary" className={this.state.ispower} style={{marginBottom:20}} onClick={this.account.bind(this)}>记账</Button>
                </div>
                <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                    <div style={{ marginBottom: 16 }}>
                        <Button className={this.state.isaccount} type="primary" onClick={this.start.bind(this)}>花费</Button>
                        &nbsp;&nbsp;&nbsp;
                        <Button className={this.state.isaccount} type="primary" onClick={this.start.bind(this)}>充值</Button>
                        <span style={{ marginLeft: 8 }}>{hasSelected ? `选择了 ${selectedRowKeys.length} 个团员` : ''}</span>
                    </div>
                    <Table columns={columns} dataSource={this.state.data} />
                </div>
            </Card>
        </div>
    }
}
// billManage.defaultProps={teamItems:teamItems};//设置默认属性
export default Messages;
