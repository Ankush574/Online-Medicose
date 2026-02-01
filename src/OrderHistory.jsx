import React, { useEffect, useMemo, useState } from "react";
import "./OrderHistory.css";

const orderSeed = [
	{
		id: "ORD-93821",
		placedOn: "Jan 08, 2026",
		status: "inTransit",
		eta: "Arrives Jan 11",
		deliveryWindow: "10:00 - 12:00 AM",
		total: 845.5,
		pharmacy: "MediExpress Hub",
		trackingId: "ME-58421",
		channel: "Home delivery",
		items: [
			{ id: "metformin", name: "Metformin 500mg", quantity: 60, price: 420 },
			{ id: "amlodipine", name: "Amlodipine 5mg", quantity: 30, price: 169 }
		],
		shippingAddress: "221B Baker Street, London",
		paymentMethod: "Visa ·••4123",
		coolChain: "2-8°C maintained",
		timeline: [
			{ id: "placed", label: "Order placed", timestamp: "Jan 08 · 09:12 AM", status: "done" },
			{ id: "packed", label: "Packed at pharmacy", timestamp: "Jan 08 · 02:35 PM", status: "done" },
			{ id: "courier", label: "Courier picked up", timestamp: "Jan 09 · 07:10 AM", status: "current" },
			{ id: "delivery", label: "Out for delivery", timestamp: "Jan 11", status: "upcoming" }
		]
	},
	{
		id: "ORD-93602",
		placedOn: "Jan 05, 2026",
		status: "delivered",
		eta: "Delivered Jan 07",
		deliveryWindow: "Signed 04:22 PM",
		total: 312.25,
		pharmacy: "City Medical Store",
		trackingId: "CMS-33091",
		channel: "Store pickup",
		items: [
			{ id: "lisinopril", name: "Lisinopril 10mg", quantity: 30, price: 132.25 },
			{ id: "aspirin", name: "Aspirin 81mg", quantity: 90, price: 180 }
		],
		shippingAddress: "Pickup · City Medical Store",
		paymentMethod: "UPI ·••9821",
		coolChain: "Ambient",
		timeline: [
			{ id: "placed", label: "Order placed", timestamp: "Jan 05 · 10:04 AM", status: "done" },
			{ id: "ready", label: "Ready for pickup", timestamp: "Jan 06 · 05:20 PM", status: "done" },
			{ id: "delivered", label: "Picked up", timestamp: "Jan 07 · 04:22 PM", status: "done" }
		]
	},
	{
		id: "ORD-93488",
		placedOn: "Jan 02, 2026",
		status: "processing",
		eta: "Awaiting confirmation",
		deliveryWindow: "Rx verification",
		total: 128.4,
		pharmacy: "Metro Health Mart",
		trackingId: "MHM-21981",
		channel: "Home delivery",
		items: [
			{ id: "budesonide", name: "Budesonide inhaler", quantity: 1, price: 128.4 }
		],
		shippingAddress: "742 Evergreen Terrace, Springfield",
		paymentMethod: "Mastercard ·••7728",
		coolChain: "Temperature controlled",
		timeline: [
			{ id: "placed", label: "Order placed", timestamp: "Jan 02 · 11:43 AM", status: "done" },
			{ id: "review", label: "Pharmacist reviewing Rx", timestamp: "Jan 02 · 12:05 PM", status: "current" },
			{ id: "fulfillment", label: "Packing", timestamp: "Pending", status: "upcoming" }
		]
	}
];

const statusFilters = [
	{ id: "all", label: "All" },
	{ id: "inTransit", label: "In transit" },
	{ id: "processing", label: "Processing" },
	{ id: "delivered", label: "Delivered" }
];

const statusTokens = {
	inTransit: { label: "In transit", tone: "info" },
	processing: { label: "Processing", tone: "warning" },
	delivered: { label: "Delivered", tone: "success" }
};

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const OrderHistory = ({ embedded = false }) => {
	const [orders] = useState(orderSeed);
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedOrder, setSelectedOrder] = useState(orderSeed[0]);
	const [toast, setToast] = useState("");

	const filteredOrders = useMemo(() => {
		if (statusFilter === "all") return orders;
		return orders.filter((order) => order.status === statusFilter);
	}, [orders, statusFilter]);

	useEffect(() => {
		if (filteredOrders.length === 0) {
			setSelectedOrder(undefined);
			return;
		}
		if (!selectedOrder || !filteredOrders.some((order) => order.id === selectedOrder.id)) {
			setSelectedOrder(filteredOrders[0]);
		}
	}, [filteredOrders, selectedOrder]);

	useEffect(() => {
		if (!toast) return;
		const timer = setTimeout(() => setToast(""), 2200);
		return () => clearTimeout(timer);
	}, [toast]);

	const metrics = useMemo(() => {
		const delivered = orders.filter((order) => order.status === "delivered").length;
		const inFlight = orders.filter((order) => ["inTransit", "processing"].includes(order.status)).length;
		const spend = orders.reduce((total, order) => total + order.total, 0);
		return [
			{ id: "delivered", label: "Delivered", value: delivered, meta: "Completed orders" },
			{ id: "inTransit", label: "In motion", value: inFlight, meta: "Needs tracking" },
			{ id: "spend", label: "Spend to date", value: formatCurrency(spend), meta: "last 30 days" }
		];
	}, [orders]);

	const handleAction = (message) => {
		setToast(message);
	};

	const workspace = (
		<section className="orders-shell">
			<header className="orders-hero">
				<div>
					<p className="eyebrow">Fulfillment history</p>
					<h1>Orders & deliveries</h1>
					<p>Track shipments, invoices, and reorder ready-made medication bundles.</p>
				</div>
				<div className="hero-actions">
					<button className="primary-btn" onClick={() => handleAction("Export link emailed.")}>Export orders</button>
					<button className="ghost-btn" onClick={() => handleAction("Shareable tracking link copied.")}>Share tracking link</button>
				</div>
			</header>

			<section className="orders-metrics">
				{metrics.map((metric) => (
					<article key={metric.id} className="orders-metric-card">
						<p className="metric-label">{metric.label}</p>
						<p className="metric-value">{metric.value}</p>
						<p className="metric-meta">{metric.meta}</p>
					</article>
				))}
			</section>

			<div className="filter-pills" role="tablist">
				{statusFilters.map((filter) => (
					<button
						key={filter.id}
						type="button"
						className={`filter-pill ${statusFilter === filter.id ? "active" : ""}`}
						onClick={() => setStatusFilter(filter.id)}
					>
						{filter.label}
					</button>
				))}
			</div>

			<div className="orders-layout">
				<div className="orders-primary">
					{toast && <div className="toast success">{toast}</div>}
					<section className="orders-feed" aria-live="polite">
						{filteredOrders.length === 0 ? (
							<div className="empty-state">
								<div className="empty-illustration" aria-hidden>📦</div>
								<h3>No orders here</h3>
								<p>Change the filter or place a new order to start tracking deliveries.</p>
							</div>
						) : (
							<ul>
								{filteredOrders.map((order) => {
									const token = statusTokens[order.status] || statusTokens.delivered;
									return (
										<li
											key={order.id}
											className={`order-card ${selectedOrder?.id === order.id ? "order-card--active" : ""}`}
											onClick={() => setSelectedOrder(order)}
										>
											<header>
												<div>
													<p className="eyebrow">{order.id}</p>
													<h3>{order.pharmacy}</h3>
													<p>Placed {order.placedOn}</p>
												</div>
												<span className={`order-status order-status--${token.tone}`}>{token.label}</span>
											</header>
											<div className="order-meta">
												<div>
													<p className="muted">ETA</p>
													<p>{order.eta}</p>
													<span>{order.deliveryWindow}</span>
												</div>
												<div>
													<p className="muted">Tracking</p>
													<p>{order.trackingId}</p>
													<span>{order.channel}</span>
												</div>
												<div>
													<p className="muted">Total</p>
													<p>{formatCurrency(order.total)}</p>
												</div>
											</div>
											<div className="order-items">
												{order.items.slice(0, 2).map((item) => (
													<span key={item.id}>{item.name} × {item.quantity}</span>
												))}
												{order.items.length > 2 && <span>+ {order.items.length - 2} more</span>}
											</div>
											<footer>
												<button className="ghost-btn" onClick={(event) => {
													event.stopPropagation();
													handleAction("Tracking link opened.");
												}}>
													Track
												</button>
												<button className="ghost-btn" onClick={(event) => {
													event.stopPropagation();
													handleAction("Invoice ready in downloads.");
												}}>
													Invoice
												</button>
											</footer>
										</li>
									);
								})}
							</ul>
						)}
					</section>
				</div>

				<aside className="orders-secondary">
					{selectedOrder ? (
						<section className="order-detail">
							<header>
								<div>
									<p className="eyebrow">Details</p>
									<h2>{selectedOrder.id}</h2>
									<p>{selectedOrder.pharmacy}</p>
								</div>
								<span>{selectedOrder.paymentMethod}</span>
							</header>
							<div className="detail-meta">
								<div>
									<p className="muted">Ship to</p>
									<p>{selectedOrder.shippingAddress}</p>
								</div>
								<div>
									<p className="muted">Cold chain</p>
									<p>{selectedOrder.coolChain}</p>
								</div>
							</div>
							<div className="detail-items">
								<h3>Items</h3>
								<ul>
									{selectedOrder.items.map((item) => (
										<li key={item.id}>
											<span>{item.name}</span>
											<span>{item.quantity} units · {formatCurrency(item.price)}</span>
										</li>
									))}
								</ul>
							</div>
							<div className="detail-timeline">
								<h3>Timeline</h3>
								<ol>
									{selectedOrder.timeline.map((event) => (
										<li key={event.id} className={`timeline-event timeline-event--${event.status}`}>
											<div>
												<strong>{event.label}</strong>
												<p>{event.timestamp}</p>
											</div>
										</li>
									))}
								</ol>
							</div>
							<div className="detail-actions">
								<button className="primary-btn" onClick={() => handleAction("Live tracking opened.")}>Track package</button>
								<button className="ghost-btn" onClick={() => handleAction("Invoice downloaded.")}>Download invoice</button>
								<button className="ghost-btn" onClick={() => handleAction("Items moved to cart.")}>Reorder items</button>
							</div>
						</section>
					) : (
						<div className="empty-state">
							<div className="empty-illustration" aria-hidden>🧾</div>
							<h3>No order selected</h3>
							<p>Choose an order from the list to inspect its items and fulfillment journey.</p>
						</div>
					)}
				</aside>
			</div>
		</section>
	);

	return embedded ? (
		<div className="orders-embedded">{workspace}</div>
	) : (
		<div className="orders-route">{workspace}</div>
	);
};

export default OrderHistory;