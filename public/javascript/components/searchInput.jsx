import React from 'react';
import { Input, Button } from 'antd';
import '../stylesheets/searchInput.scss';

class SearchInput extends React.Component{
    constructor(props) {
        super(props);
        this.state = {value: '', focus: false,items:[]};
    }
    handleInputChange(e) {
        const url = this.props.url;
        if(url){
            $.ajax({
                url: url+e.target.value,
                type: 'get',
                success: function(data) {
                    console.log("提交成功");
                    this.setState({items:data.result});
                }.bind(this),
                error: function(xhr, status, err) {
                    console.log(this.props.url, status, err.toString());
                }.bind(this)
            });
        }
    }
    handleSelect(e){
        const target = e.target;
        const provider = target.dataset.provider;
        const user_id = target.dataset.userid;
        const user_name = target.dataset.name;
        this.setState({items:[],provider:provider,user_id:user_id,user_name:user_name});
        this.refs.input.refs.input.value = user_name;
    }
    render() {
        const { style, size, placeholder } = this.props;
        const { items, provider, user_id, user_name } = this.state;
        var that = this;
        return (
            <div className="ant-search-input-wrapper" style={style}>
                <Input ref='input' size={size} placeholder={placeholder} data-provider={provider} data-userid={user_id}  data-name={user_name} onChange={this.handleInputChange.bind(this)} />
                <input style={{display:'none'}} name='provider' value={provider}></input>
                <input style={{display:'none'}} name='user_id' value={user_id}></input>
                <ul>{items.map(function(item){
                    return <li className='search-list' data-provider={item.provider} data-userid={item.user_id} data-name={item.user_name} onClick={that.handleSelect.bind(that)}>{item.name}</li>
                })}
                </ul>
            </div>
        );
    }
}

export default SearchInput;