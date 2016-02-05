var Navbar = React.createClass({
	onClickPay: function(){
		this.props.changePage('payment');
		console.log('clicked pay', this.props); 
	},
	render: function() {
		return (
			<nav className="navbar navbar-default navbar-fixed-top">
				<div className="container-fluid">
					<div className="navbar-header">
						<a className="navbar-brand" href="#">
							Плати За Входа
						</a>
					</div>
					<div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
						<ul className="nav navbar-nav">
							<li><a href="#">Апартаменти</a></li>
						</ul>

					</div>
				</div>
			</nav>
		);
	}
});
/*<li><button type="button" className="btn btn-default navbar-btn" onClick={this.onClickPay}>Плати</button></li>*/

//var Apartment = React.createClass({
//	render: function() {
//		return (
//			<div>
//			</div>
//			);
//	}
//});
//
//var ApartmentsList = React.createClass({
//	render: function() {
//		return ();
//	}
//});

var MakePayment = React.createClass({
	getInitialState: function() {
		return {}
	},
	handleSetAmount: function(e){
		this.setState({amount: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var data = {
			amount: this.state.amount,
			number: this.props.ap.number
		};
		console.log('Send payment:', data);
		$.ajax('/api/make_payment', {
			cache: false,
			dataType: 'json',
			type: 'POST',
			data: data,
			success: function(data) {
				console.log('Payment result:', data);
				this.setState({result: data.result});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		if(!this.props.ap) {
			return ( 
				<div>No apartment selected</div> 
			);
		}
		return (
			<form onSubmit={this.handleSubmit}>
				<span>Ап {this.props.ap.number}: {this.props.ap.name}</span>
				<br/>
				<span>Сума:</span>
				<input type="text" name="amount" require="true" onChange={this.handleSetAmount}/>
				<br/>
				<input type="submit" value="Плати"/>
			</form>
		);
	}
});
//defaultValue={this.props.ap.debt}
	
var PaymentsHistory = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		$.ajax('/api/payments',{
			cache: false,
			dataType: 'json',
			success: function(data) {
				console.log('Payments data:', data);
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err){
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		let index = 0;
		var payments = this.state.data.map(function(it){
			return (
				<li key={++index}>{JSON.stringify(it)}</li>
			);
		});
		return (
			<div>
				<h1>Payments</h1>
				<ul>
					{payments}
				</ul>
			</div>
		);
	}
});

var ApartmentsBox = React.createClass({
	getInitialState: function() {
		return {data: {}};
	},
	componentDidMount: function() {
		$.ajax('/api/apartments', {
			cache: false,
			dataType: 'json',
			success: function(data) {
				console.log('Apartments data:', data);
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	setActiveApartment: function(ap) {
		this.props.setActiveApartment(ap);
	},
	render: function() {
		var that = this;
		var aps = Object.keys(this.state.data).map(function(key) {
			var ap = that.state.data[key];
			return (
				<a href="#" onClick={that.setActiveApartment.bind(that, ap)} key={ap.number}><div key={ap.number}>{ap.number} - {ap.name}. Payed: {ap.balance}. Debt: {ap.debt}</div></a>
			);
		});
		return (
			<div>
				<h1>Apartments</h1>
				<div className="apartmentsList">
					{aps}
				</div>
			</div>
		);
	}
});

var HouseMgmt = React.createClass({
	getInitialState: function() {
		return {
			currentPage: 'apartments'
		}
	},
	setGlobalProp: function(val) {
		this.setState({currentPage: val});
	},
	setActiveApartment: function(ap) {
		console.log('Set active apartment', ap);
		this.setState({activeApartment: ap});
	},
	render: function() {
		return (
			<div>
				<Navbar changePage={this.setGlobalProp}/>
				<ApartmentsBox setActiveApartment={this.setActiveApartment}/>
				<MakePayment ap={this.state.activeApartment}/>
				<PaymentsHistory/>
			</div>
		);
	}
});

ReactDOM.render(
  <HouseMgmt globalState={{currentPage: 'apartments'}} />,
  document.getElementById('content')
);