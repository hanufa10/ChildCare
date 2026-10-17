
using Daycare.Api.Models;
using MediatR;

namespace Daycare.Api.Features.Children.Queries;

public record GetChildByIdQuery(int Id) : IRequest<Child?>;
