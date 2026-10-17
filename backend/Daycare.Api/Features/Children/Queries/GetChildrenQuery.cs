using Daycare.Api.Models;
using MediatR;

namespace Daycare.Api.Features.Children.Queries;

public record GetChildrenQuery : IRequest<List<Child>>;